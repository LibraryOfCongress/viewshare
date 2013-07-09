/*global define */
define(
  [
    'freemix',
    'jquery',
    'observer',
    'freemix.exhibit',
    'freemix.property',
    'freemix.identify',
  ],
  function (
    Freemix,
    $,
    Observer
  ) {
  'use strict';

  /**
   * Represents the name, type, and value of a single attribute of a
   * single item in a DataSource
   * @constructor
   * @param {string} options.id - ID of the property as identified by Freemix
   * @param {string} options.name - Name of the property
   * @param {string} options.type - Type of the property.
   * Current types include:
   * * text
   * * URL
   * * image
   * * date/time
   * * location
   * * number
   * @param {string} options.value - Value of the property
   */
  var
    PropertyModel = function(options) {
      this.initialize.apply(this, [options]);
    },
    PropertyModelObserver = new Observer();

  $.extend(PropertyModel.prototype, PropertyModelObserver, {
    initialize: function(options) {
      this.id = options.id;
      this._name = options.name;
      this._type = options.type;
      this.value = options.value;
      if (Freemix.property.propertyList && Freemix.property.propertyList.hasOwnProperty(this.id)) {
        // this is an existing Property
        this.freemixProperty = Freemix.property.propertyList[this.id];
      } else {
        // this is a new property
        this.freemixProperty = undefined;
      }
    },

    /** getter/setter method for name */
    name: function(newName) {
      if (newName) {
        this._name = newName;
        if (this.freemixProperty) {
          // This is not a new Property so we can modify it in Freemix
          this.freemixProperty.label(this._name);
        }
      } else {
        return this._name;
      }
    },

    /**
     * getter/setter method for type
     * @param {string} newType - Type value for this
     * @param {bool} options.silent - Flag for triggering changeType event
     */
    type: function(newType, options) {
      var silent;
      if (newType) {
        silent = (options && options.silent) || false;
        this._type = newType;
        if (this.freemixProperty) {
          // This is not a new Property so we can modify it in Freemix
          this.freemixProperty.type(this._type);
        }
        // publish event to signal other RecordModels should change the type
        // for this property
        if (!silent) {
          this.Observer('changeType').publish({
            name: this._name,
            type: this._type
          });
        }
      } else {
        return this._type;
      }
    },

    /** Generate an array used to identify tags in Freemix */
    tags: function() {
      if (['location', 'date'].indexOf(this._type) >= 0) {
        // certain Property types have a special tags value
        return ['property:type=' + this._type];
      } else {
        return [];
      }
    },

    /** Create a Freemix Property with our Model's data */
    createFreemixProperty: function() {
      var freemixProperty = {
        property: this._name,
        label: this._name,
        enabled: true,
        tags: this.tags(),
        types: [this._type]
      };
      return freemixProperty;
    },

    /**
     * Validate that the data in this Model is in a state where it could
     * be sent to a server.
     */
    validate: function() {
      var errors = {};
      if (!this._name) {
        errors['name'] = 'Please enter a name for the new property.';
      }
      return errors;
    }
  });

  return PropertyModel;
});
