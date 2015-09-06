'use strict';
var xhr = require('xmlhttprequest');
module.exports = function getXMLHttpRequest() {
  var request = new xhr.XMLHttpRequest();
  request.setDisableHeaderCheck(true);
  return request;
};
