/* global window, document */

var $ = require('jquery');
var algoliasearch = require('algoliasearch');

$(document).ready(function() {
  console.log($, algoliasearch);
  window.alert('ready!');
});
