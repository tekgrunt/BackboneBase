define([
  'backbone',
  'relational'
], function (Backbone) {
  'use strict';
  var scope = {};
  Backbone.Relational.store.addModelScope(scope);
  return scope;
});
