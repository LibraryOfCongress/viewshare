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
   * properties such an array created from a comma-separated value.
   * @param {string} options.extract - label of other property used to
   * create this PatternProperty
   */
  var PatternPropertyModel = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(PatternPropertyModel.prototype, PropertyModel.prototype, {
    initialize: function(options) {
      PropertyModel.prototype.initialize.apply(this, [options]);
      this._extract = options.extract;
      if (Freemix.property.propertyList && Freemix.property.propertyList.hasOwnProperty(this.id)) {
        // this is an existing Property
        this.freemixProperty = Freemix.property.propertyList[this.id];
      } else {
        // this is a new property and doesn't exist in Freemix yet
        this.freemixProperty = undefined;
      }
    },

    /**
     * getter/setter method - extract is the name of the PropertyModel
     * that this PatternPropertyModel originates from.
     */
    extract: function(newPattern) {
      if (newPattern) {
        this._extract = newPattern;
        if (this.freemixProperty) {
          // This is not a new Property so we can modify it in Freemix
          this.freemixProperty.label(this._extract);
        }
      } else {
        return this._extract;
      }
    },

    /** Generate an array used to identify tags in Freemix */
    tags: function() {
      return ['property:type=text', 'property:type=shredded_list'];
    },

    /** Create a Freemix Property with our Model's data */
    createFreemixProperty: function() {
      var freemixProperty = {
        property: this._name,
        label: this._name,
        enabled: true,
        tags: this.tags(),
        types: [this._type],
        extract: this.extract()
      };
      return freemixProperty;
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
      if (!this._extract.length) {
        errors.extract = 'Please select at least one property.';
      }
      return errors;
    }
  });

  return PatternPropertyModel;
});
