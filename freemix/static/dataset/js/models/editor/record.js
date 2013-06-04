/*global define */
define(['jquery', 'models/property'], function ($, PropertyModel) {
  'use strict';

  /**
   * Represents the collection of properties of a
   * single item in a DataSource
   * @constructor
   * @param {string} options.properties - Array of {name, type, value} objects
   */
  var RecordModel = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(RecordModel.prototype, {
    initialize: function(options) {
      var property, i;
      this.properties = [];
      for(i = 0; i < options.properties.length; i++) {
        property = options.properties[i];
        this.properties.push(new PropertyModel(property));
      }
    }
  });

  return RecordModel;
});