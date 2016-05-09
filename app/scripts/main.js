/* global require */
'use strict';

require.config({
  shim: {
    bootstrap: {
      deps: ['jquery'],
      exports: 'bootstrap'
    }
  },
  baseUrl: '/scripts/',
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/lodash/lodash',
    bootstrap: '../bower_components/bootstrap-sass/assets/javascripts/bootstrap.min',
    text: '../bower_components/text/text',
    modernizr: '../bower_components/modernizr/modernizr',
    relational: '../bower_components/backbone-relational/backbone-relational',
    marionette: '../bower_components/backbone.marionette/lib/backbone.marionette',
    urijs: '../bower_components/urijs/src',
    velocity: '../bower_components/velocity/velocity.js'
  }
});

require([
  'backbone',
  'routes/router',
  'jquery',
  'velocity',
  'bootstrap',
  'relational'
], function (Backbone, Router, $) {
  $(function () {
    new Router().start();
  });
});
