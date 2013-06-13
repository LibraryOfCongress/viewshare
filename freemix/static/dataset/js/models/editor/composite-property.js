/*global define */
define(
  [
    'freemix',
    'jquery',
    'models/property',
    'freemix.exhibit',
    'freemix.property',
    'freemix.identify'
  ],
  function (
    Freemix,
    $,
    PropertyModel
  ) {
  'use strict';

  /**
   * Extends PropertyModel. Represents a property that is created from other
   * properties such as a Latitude/Longitude pair.
   * @param {array} options.composite - labels of other properties used to
   * create this CompositeProperty
   */
  var CompositePropertyModel = function(options) {
      this.initialize.apply(this, [options]);
    }

  $.extend(CompositePropertyModel.prototype, PropertyModel.prototype, {
    initialize: function(options) {
      PropertyModel.prototype.initialize.apply(this, [options]);
      this.composite = options.composite;
      this.tags.bind(this)
    },

    /** Generate an array used to identify tags in Freemix */
    tags: function() { return ['property:type=' + this.type];}
  });

  return CompositePropertyModel;
});
