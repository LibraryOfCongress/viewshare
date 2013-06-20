/*global define */
define(
  [
   'jquery',
   'models/composite-property',
   'models/property'
  ],
  function (
    $,
    CompositePropertyModel,
    PropertyModel)
  {
  'use strict';

  /**
   * Represents the collection of properties of a single item in a DataSource
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
        if (property.composite !== null) {
          this.properties.push(new CompositePropertyModel(property));
        } else {
          this.properties.push(new PropertyModel(property));
        }
      }
      this.properties.sort(function (a, b) {
        var
          a_name = a && a.name() || '',
          b_name = b && b.name() || '';
          return a_name.localeCompare(b_name);
      });
    }
  });

  return RecordModel;
});
