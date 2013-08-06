/*global define */
define(
  [
    'jquery',
    'observer',
  ],
  function (
    $,
    Observer
  ) {
  'use strict';

  /**
   * Represents the name, type, and value of a single attribute of a
   * single item in a DataSource
   * @constructor
   * @param {string} options.id - ID of the property
   * @param {string} options.label - Label for display purposes
   * @param {string} options.type - Type of the property.
   * Current types include:
   * * text
   * * URL
   * * image
   * * date/time
   * * location
   * * number
   * @param {array} options.items - Array of data values
   */
  var
    PropertyModel = function(options) {
      this.initialize.apply(this, [options]);
    },
    PropertyModelObserver = new Observer();

  $.extend(PropertyModel.prototype, PropertyModelObserver, {
    initialize: function(options) {
      this.id = options.id;
      this._label = options.label;
      this._type = options.type;
      this.items = options.items;
    },

    /** getter/setter method for label */
    label: function(newLabel) {
      if (newLabel) {
        this._label = newLabel;
        // TODO: post data to server
      } else {
        return this._name;
      }
    },

    /**
     * getter/setter method for type
     * @param {string} newType - Type value for this
     */
    type: function(newtype) {
      if (newtype) {
        this._type = newtype;
        // TODO: post data to server
      } else {
        return this._name;
      }
    },

    /**
     * Validate that the data in this Model is in a state where it could
     * be sent to a server.
     * @param {array} propertyNames - names that already exist and should not
     * be duplicated
     */
    validate: function(propertyNames) {
      var errors = {},
      existingNames = propertyNames || [];
      if (!this._name) {
        errors.name = 'Please enter a name for the new property.';
      } else if (existingNames.indexOf(this._name) >= 0) {
        errors.name = 'Please enter a unique property name.';
      }
      return errors;
    }
  });

  return PropertyModel;
});
