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
    var config, queryObject;
    if (!this._config.headers || !this._config.headers["Content-Type"] || !this._config.headers["Content-Type"].match(/application\/json/)) {
      queryObject = this.buildQueryObject(this._jsongUrl, method, {
        jsonGraph: jsongEnv,
        method: 'set'
      });
      config = simpleExtend(queryObject, this._config);
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      config = simpleExtend({
        url: this._jsongUrl,
        data: JSON.stringify({
          jsonGraph: JSON.stringify(jsongEnv),
          method: 'set'
        })
      }, this._config);
    }
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
    var config, queryData = [], queryObject;
    if (!this._config.headers || !this._config.headers["Content-Type"] || !this._config.headers["Content-Type"].match(/application\/json/)) {
      queryData.push('method=call');
      queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));
      queryData.push('arguments=' + encodeURIComponent(JSON.stringify(args)));
      queryData.push('pathSuffixes=' + encodeURIComponent(JSON.stringify(pathSuffix)));
      queryData.push('paths=' + encodeURIComponent(JSON.stringify(paths)));

      queryObject = this.buildQueryObject(this._jsongUrl, method, queryData.join('&'));
      config = simpleExtend(queryObject, this._config);
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      config = simpleExtend({
        url: this._jsongUrl,
        data: JSON.stringify({
          method: 'call',
          callPath: JSON.stringify(callPath),
          arguments: JSON.stringify(args),
          pathSuffixes: JSON.stringify(pathSuffix),
          paths: JSON.stringify(paths)
        })
      }, this._config);
    }
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
