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
            paths: pathSet,
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
            jsong: jsongEnv,
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

        queryData.push('method=call');
        queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));
        queryData.push('arguments=' + encodeURIComponent(JSON.stringify(args)));
        queryData.push('pathSuffixes=' + encodeURIComponent(JSON.stringify(pathSuffix)));
        queryData.push('paths=' + encodeURIComponent(JSON.stringify(paths)));

        var config = buildQueryObject(this._jsongUrl, method, queryData.join('&'));
        return request(method, config);
    }
};
// ES6 modules
XMLHttpSource.XMLHttpSource = XMLHttpSource;
XMLHttpSource['default'] = XMLHttpSource;
// commonjs
module.exports = XMLHttpSource;
