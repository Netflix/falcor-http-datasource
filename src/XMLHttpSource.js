'use strict';
var falcor = require('falcor');

var request = require('./request');
var buildQueryObject = require('./buildQueryObject');
var isArray = Array.isArray;

function XMLHttpSource(jsongUrl, timeout) {
    this._jsongUrl = jsongUrl;
    this._timeout = timeout || 15000;
}

XMLHttpSource.prototype = {
    /**
     * @inheritDoc DataSource#get
     */
    get: function (pathSet) {
        var method = 'GET';
        var config = buildQueryObject(this._jsongUrl, method, {
            path: pathSet,
            method: 'get'
        });
        return request(method, config);
    },
    /**
     * @inheritDoc DataSource#set
     */
    set: function (jsongEnv) {
        var method = 'POST';
        var config = buildQueryObject(this._jsongUrl, method, {
            path: jsongEnv,
            method: 'set'
        });
        return request(method, config);
    },

    /**
     * @inheritDoc DataSource#call
     */
    call: function (callPath, args, pathSuffix, paths) {
        var method = 'POST';
        var queryData = [];
        args = args || [];
        pathSuffix = pathSuffix || [];
        paths = paths || [];
        paths.forEach(function (path) {
            queryData.push('path=' + encodeURIComponent(JSON.stringify(path)));
        });

        queryData.push('method=call');
        queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));

        if (Array.isArray(args)) {
            args.forEach(function (value) {
                queryData.push('param=' + encodeURIComponent(JSON.stringify(value)));
            });
        }

        if (Array.isArray(pathSuffix)) {
            pathSuffix.forEach(function (value) {
                queryData.push('pathSuffix=' + encodeURIComponent(JSON.stringify(value)));
            });
        }

        var config = buildQueryObject(this._jsongUrl, method, queryData.join('&'));
        return request(method, config);
    }
};
// ES6 modules
XMLHttpSource.XMLHttpSource = XMLHttpSource;
XMLHttpSource['default'] = XMLHttpSource;
// commonjs
module.exports = XMLHttpSource;
