'use strict';
var Observable = require('falcor').Observable;
var getXMLHttpRequest = require('./getXMLHttpRequest');
var getCORSRequest = require('./getCORSRequest');
var hasOwnProp = Object.prototype.hasOwnProperty;

function request(method, options) {
    return Observable.create(function(observer) {
        var config = {
            method: 'GET',
            crossDomain: false,
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            async: true,
            headers: {},
            responseType: 'json'
        };
        var xhr,
            progressObserver,
            isDone,
            headers,
            header,
            prop;

        if (typeof options === 'string') {
            config.url = options;
        } else {
            for (prop in options) {
                if (hasOwnProp.call(options, prop)) {
                    config[prop] = options[prop];
                }
            }
        }

        try {
            xhr = config.crossDomain ? getCORSRequest() : getXMLHttpRequest();
        } catch (err) {
            observer.onError(err);
        }

        // Add request with Headers
        if (!config.crossDomain && !config.headers['X-Requested-With']) {
          config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }

        // Fills the request headers
        headers = config.headers;
        for (header in headers) {
            if (hasOwnProp.call(headers, header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }

        // Content
        config.hasContent = config.body !== undefined;

        // Progress
        progressObserver = config.progressObserver;

        // Sets timeout information
        xhr.timeout = config.timeout;

        // Anything but explicit false results in true.
        xhr.withCredentials = config.withCredentials !== false;


        try {
            // Takes the url and opens the connection
            if (config.user) {
                xhr.open(method || config.method, config.url, config.async, config.user, config.password);
            } else {
                xhr.open(method || config.method, config.url, config.async);
            }


            // Sends the request.
            if (!!xhr.upload || (!('withCredentials' in xhr) && !!global.XDomainRequest)) {
                // Link the response methods
                xhr.onload = function onload(e) {
                    onXhrLoad(observer, progressObserver, xhr, xhr.status, e);
                    isDone = true;
                };

                // Progress
                if (progressObserver) {
                    xhr.onprogress = function onprogress(e) {
                        progressObserver.onNext(e);
                    };
                }

                // Error
                xhr.onerror = function onerror(e) {
                    onXhrError(observer, progressObserver, xhr, xhr.status, e);
                    isDone = true;
                };

                // Abort
                xhr.onabort = function onabort(e) {
                    onXhrError(observer, progressObserver, xhr, xhr.status, e);
                    isDone = true;
                };

            // Legacy
            } else {

                xhr.onreadystatechange = function onreadystatechange(e) {
                    // Complete
                    if (xhr.readyState === 4) {
                        var status = xhr.status === 1223 ? 204 : xhr.status;
                        onXhrLoad(observer, config.progressObserver, xhr, status, e);
                        isDone = true;
                    }
                };
            }

            // Timeout
            xhr.ontimeout = function ontimeout(e) {
                onXhrError(observer, progressObserver, xhr, 'timeout error', e);
                isDone = true;
            };

            // Send Request
            xhr.send(config.hasContent ? config.body : null);

        } catch (e) {
            observer.onError(e);
        }
        // Dispose
        return function dispose() {
            // Doesn't work in IE9
            if (!isDone && xhr.readyState !== 4) {
                xhr.abort();
            }
        };//Dispose
    });
}

/*
 * General handling of a successfully completed request (that had a 200 response code)
 */
function _handleXhrComplete(observer, data) {
    observer.onNext(data);
    observer.onCompleted();
}

/*
 * General handling of ultimate failure (after appropriate retries)
 */
function _handleXhrError(observer, textStatus, errorThrown) {
    // IE9: cross-domain request may be considered errors
    if (!errorThrown) {
        errorThrown = new Error(textStatus);
    }

    observer.onError(errorThrown);
}

function onXhrLoad(observer, progressObserver, xhr, status, e) {
    var responseData,
        responseObject;

    // If there's no observer, the request has been (or is being) cancelled.
    if (xhr && observer) {
        responseData = ('response' in xhr) ? xhr.response : xhr.responseText;

        // If there is a progress observer
        if (progressObserver) {
            _handleXhrComplete(progressObserver, e);
        }

        //
        if ((status >= 200 && status <= 399)) {
            try {
                responseData = JSON.parse(responseData || '');
            } catch (e) {
                _handleXhrError(observer, 'invalid json', e);
            }

            return _handleXhrComplete(observer, responseData);

        } else if (status === 401 || status === 403 || status === 407) {

            return _handleXhrError(observer, responseData);

        } else if (status === 410) {
            // TODO: Retry ?
            return _handleXhrError(observer, responseData);

        } else if (status === 408 || status === 504) {
            // TODO: Retry ?
            return _handleXhrError(observer, responseData);

        } else {

            return _handleXhrError(observer, responseData || ('Response code ' + status));

        }//if
    }//if
}//onXhrLoad

function onXhrError(observer, progressObserver, xhr, status, e) {
    if (progressObserver) {
        _handleXhrError(progressObserver, xhr, e);
    }
    _handleXhrError(observer, status || xhr.statusText || 'request error', e);
}

module.exports = request;
