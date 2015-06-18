'use strict';
var falcor = require('falcor');

var request = require('./request');
var buildQueryObject = require('./buildQueryObject');
var isArray = Array.isArray;

function simpleExtend(obj, obj2) {
    var prop;
    for (prop in obj2) {
        obj[prop] = obj2[prop];
    }
    return obj;
}

function XMLHttpSource(jsongUrl, config) {
    this._jsongUrl = jsongUrl;
    if (typeof config === 'number') {
        var newConfig = {
            timeout: config
        };
        config = newConfig;
    }
    this._config = simpleExtend({
        timeout: 15000,
        headers: {}
    }, config || {});
}

XMLHttpSource.prototype = {
    // because javascript
    constructor: XMLHttpSource,
    /**
     * @inheritDoc DataSource#get
     */
    get: function (pathSet) {
        var self = this;
        var method = 'GET';
        var queryObject = buildQueryObject(this._jsongUrl, method, {
            path: pathSet,
            method: 'get'
        });
        var config = simpleExtend(queryObject, this._config);
        return request(method, config, self);
    },
    /**
     * @inheritDoc DataSource#set
     */
    set: function (jsongEnv) {
        var method = 'POST';
        var queryObject = buildQueryObject(this._jsongUrl, method, {
            jsong: jsongEnv,
            method: 'set'
        });
        var config = simpleExtend(queryObject, this._config);
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

        var queryObject = buildQueryObject(this._jsongUrl, method, queryData.join('&'));
        var config = simpleExtend(queryObject, this._config);
        return request(method, config);
    }
};
// ES6 modules
XMLHttpSource.XMLHttpSource = XMLHttpSource;
XMLHttpSource['default'] = XMLHttpSource;
// commonjs
module.exports = XMLHttpSource;
