'use strict';
var XMLHttpRequest = require('xmlhttprequest');
module.exports = function getXMLHttpRequest() {
  return new XMLHttpRequest();
};
