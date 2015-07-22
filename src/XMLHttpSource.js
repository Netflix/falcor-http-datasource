'use strict';
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
   * buildQueryObject helper
   */
  buildQueryObject: buildQueryObject,

  /**
   * @inheritDoc DataSource#get
   */
  get: function httpSourceGet(pathSet) {
    var method = 'GET';
    var queryObject = this.buildQueryObject(this._jsongUrl, method, {
      paths: pathSet,
      method: 'get'
    });
    var config = simpleExtend(queryObject, this._config);
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);
  },

  /**
   * @inheritDoc DataSource#set
   */
  set: function httpSourceSet(jsongEnv) {
    var method = 'POST';
    var queryObject = this.buildQueryObject(this._jsongUrl, method, {
      jsonGraph: jsongEnv,
      method: 'set'
    });
    var config = simpleExtend(queryObject, this._config);
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);

  },

  /**
   * @inheritDoc DataSource#call
   */
  call: function httpSourceCall(callPath, args, pathSuffix, paths) {
    // arguments defaults
    args = args || [];
    pathSuffix = pathSuffix || [];
    paths = paths || [];

    var method = 'POST';
    var queryData = [];
    queryData.push('method=call');
    queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));
    queryData.push('arguments=' + encodeURIComponent(JSON.stringify(args)));
    queryData.push('pathSuffixes=' + encodeURIComponent(JSON.stringify(pathSuffix)));
    queryData.push('paths=' + encodeURIComponent(JSON.stringify(paths)));

    var queryObject = this.buildQueryObject(this._jsongUrl, method, queryData.join('&'));
    var config = simpleExtend(queryObject, this._config);
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);
  }
};
// ES6 modules
XMLHttpSource.XMLHttpSource = XMLHttpSource;
XMLHttpSource['default'] = XMLHttpSource;
// commonjs
module.exports = XMLHttpSource;
