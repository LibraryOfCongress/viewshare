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
      this.freemixProperty = Freemix.property.propertyList[this.id];
      this.sync.bind(this);
    },

    /** Send updated 'name' or 'type' values to the server */
    sync: function() {
      console.log('TODO: send PropertyModel values to server');
      this.Observer('syncSuccess').publish(this);
      // TODO: publish notification on success so that RecordCollection
      // can go through and update all the 'name' and 'type' values
      // for each Record with this Property
    },

    /** getter/setter method for name */
    name: function(newName) {
      if (newName) {
        this._name = newName;
        this.freemixProperty.label(this._name);
      } else {
        return this._name;
      }
    },

    /** getter/setter method for type */
    type: function(newType) {
      if (newType) {
        this._type = newType;
        this.freemixProperty.type(this._type);
      } else {
        return this._type;
      }
    }
  });

  return PropertyModel;
});
