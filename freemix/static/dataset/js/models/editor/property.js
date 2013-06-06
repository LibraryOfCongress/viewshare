/*global define */
define(['jquery', 'observer'], function ($, Observer) {
  'use strict';

  /**
   * Represents the name, type, and value of a single attribute of a
   * single item in a DataSource
   * @constructor
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
    PropertyModelObserver = Observer();

  $.extend(PropertyModel.prototype, PropertyModelObserver, {
    initialize: function(options) {
      this._name = options.name;
      this._type = options.type;
      this.value = options.value;
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
      } else {
        return this._name;
      }
    },

    /** getter/setter method for type */
    type: function(newType) {
      if (newType) {
        this._type = newType;
      } else {
        return this._type;
      }
    }
  });

  return PropertyModel;
});
