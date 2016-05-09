define([
  'jquery',
  'underscore',
  'backbone'
], function( $, _, Backbone) {
  'use strict';
  var IndexView = Backbone.View.extend({

    template: _.template(''),

    tagName: 'div',

    initialize: function() {


    $.Velocity.RunSequence([alert()
    ]);
    },
    render: function() {
      this.$el.html(this.template({
      }));

      return this;
    },
   });
  return IndexView;
});
