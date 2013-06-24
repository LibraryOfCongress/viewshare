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
  };

  $.extend(CompositePropertyModel.prototype, PropertyModel.prototype, {
    initialize: function(options) {
      PropertyModel.prototype.initialize.apply(this, [options]);
      this._composite = options.composite;
      if (Freemix.property.propertyList.hasOwnProperty(this.id)) {
        // this is an existing Property
        this.freemixProperty = Freemix.property.propertyList[this.id];
      } else {
        // this is a new property and doesn't exist in Freemix yet
        this.freemixProperty = undefined;
      }
    },

    /** getter/setter method for composite */
    composite: function(newComposite) {
      if (newComposite) {
        this._composite = newComposite;
        if (this.freemixProperty) {
          // This is not a new Property so we can modify it in Freemix
          this.freemixProperty.label(this._composite);
        }
      } else {
        return this._composite;
      }
    },

    /** Create a Freemix Property with our Model's data */
    createFreemixProperty: function() {
      var freemixProperty = Freemix.property.createProperty({
        property: this._name,
        enabled: true,
        tags: this.tags(),
        composite: this.composite()
      });
      freemixProperty.type(this._type);
      return freemixProperty;
    },

    /**
     * Validate that the data in this Model is in a state where it could
     * be sent to a server.
     */
    validate: function() {
      var errors = PropertyModel.prototype.validate.apply(this, []);
      if (!this._composite.length) {
        errors['composite'] = 'Please select at least one property.';
      }
      return errors;
    }
  });

  return CompositePropertyModel;
});
