/*global define */
define(
  [
    'jquery',
    'models/property',
  ],
  function (
    $,
    PropertyModel
  ) {
  'use strict';

  /**
   * Extends PropertyModel. Represents a property that is created from other
   * properties such as a Latitude/Longitude pair.
   * @param {string} options.augmentation - augmentation type identifier
   * @param {array} options.composite - labels of other properties used to
   * create this CompositeProperty
   */
  var CompositePropertyModel = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(CompositePropertyModel.prototype, PropertyModel.prototype, {
    initialize: function(options) {
      PropertyModel.prototype.initialize.apply(this, [options]);
      this.augmentation = options.augmentation;
      this.composite = options.composite;
    },

    /**
     * Validate that the data in this Model is in a state where it could
     * be sent to a server.
     * @param {array} propertyNames - names that already exist and should not
     * be duplicated
     */
    validate: function(propertyNames) {
      var existingNames = propertyNames || [],
      errors = PropertyModel.prototype.validate.apply(this, [existingNames]);
      if (!this.composite.length) {
        errors.composite = 'Please select at least one property.';
      }
      return errors;
    }
  });

  return CompositePropertyModel;
});
