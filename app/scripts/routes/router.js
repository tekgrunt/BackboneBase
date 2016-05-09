/* global define*/

define([
  'jquery',
  'backbone',
  'marionette',
  'urijs/URI',
  'views/index'
], function ($, Backbone, Mn, uri, IndexView) {
  'use strict';

  var RouterRouter = Backbone.Router.extend({
    routes: {
      '': 'index'
    },

    initialize: function () {
      this.container = $('#container');
      this.region = new Mn.Region({el: '#container'});

      $('body').on('click', 'a.local-link', function (event) {
        event.preventDefault();
        var location = uri(uri(event.target.href).path()).relativeTo(this.root).toString();
        this.navigate(location, {trigger: true});
      }.bind(this));
    },

    start: function () {
      this.root = '/';
      Backbone.history.start({pushState: true, root: this.root});
    },

    execute: function (callback, args) {
      this.region.empty();
      if (callback) {
        callback.apply(this, args);
      }
    },

    index: function () {
      this.region.show(new IndexView());
    }
  });

  return RouterRouter;
});
