/*global define */
define(
  [
    'jquery',
    'observer',
    'jquery.csrf'
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
   * @param {string} options.owner - URL to access type-related data for these Records
   * @param {string} options.slug - URL to access value-related data for these Records
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
      this.owner = options.owner;
      this.slug = options.slug;
      this.propertyURL = '/view/' + this.owner + '/' + this.slug + '/properties/' + this.id;
      this.dataURL =  + this.propertyURL + '/data/';
    },

    /** getter/setter method for label */
    label: function(newLabel) {
      if (newLabel) {
        this._label = newLabel;
        this.Observer('updateProperty').publish();
      } else {
        return this._label;
      }
    },

    /**
     * getter/setter method for type
     * @param {string} newType - Type value for this
     */
    type: function(newtype) {
      if (newtype) {
        this._type = newtype;
        this.Observer('updateProperty').publish();
      }
      return this._type;
    },

    /** Send this Property's attributes to the server to be saved */
    updateProperty: function() {
      var xhr = $.ajax({
        type: "PUT",
        url: this.propertyURL,
        data: JSON.stringify(this.toJSON()),
      })
      .done(this.updatePropertySuccess.bind(this))
      .fail(this.updatePropertyError.bind(this));
      return xhr;
    },

    /** 
     * Succeeded in sending property attributes to the server
     * @param {object} dataJSON - values for this property returned from dataURL
     */
    updatePropertySuccess: function(successJSON) {
      this.Observer('updatePropertySuccess').publish();
    },

    /** Failed while sending property attributes to the server */
    updatePropertyError: function(jqxhr, textStatus, error) {
      this.Observer('updatePropertyError').publish(
        {status: textStatus, error: error});
    },

    /** Attempt to load data for this property from the server */
    loadData: function() {
      var xhr = $.getJSON(this.dataURL)
        .done(this.loadDataSuccess.bind(this))
        .fail(this.loadDataError.bind(this));
      return xhr;
    },

    /** 
     * Load data for this model from successful JSON response
     * @param {object} dataJSON - values for this property returned from dataURL
     */
    loadDataSuccess: function(dataJSON) {
      this.items = dataJSON.items;
      this.Observer('loadDataSuccess').publish();
    },

    /** Failed while retrieving data for this property from the server */
    loadDataError: function(jqxhr, textStatus, error) {
      this.Observer('loadDataError').publish(
        {status: textStatus, error: error});
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
    },

    /** Return a simple object representation of this Property */
    toJSON: function() {
      return {
        id: this.id,
        valueType: this._type,
        label: this._label
      };
    }
  });

  return PropertyModel;
});
