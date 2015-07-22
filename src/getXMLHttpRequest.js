'use strict';
var xhr = require('xmlhttprequest');
module.exports = function getXMLHttpRequest() {
  return new xhr.XMLHttpRequest();
};
