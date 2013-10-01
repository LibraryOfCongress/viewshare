/*global define */
define(
  [
   'jquery',
   'models/composite-property',
   'models/property',
    'observer'
  ], function (
    $,
    CompositePropertyModel,
    PropertyModel,
    Observer
  ) {
  'use strict';

  /**
   * Represents the collection of properties of a single item in a DataSource
   * @constructor
   * @param {string} options.properties - Array of {name, type, value} objects
   */
  var RecordModel = function(options) {
    this.initialize.apply(this, [options]);
  },
  RecordModelObserver = new Observer();

  $.extend(RecordModel.prototype, RecordModelObserver, {
    initialize: function(options) {
      var property, i;
      this.properties = [];
      this.handleChangeType = this.handleChangeType.bind(this);
      for(i = 0; i < options.properties.length; i++) {
        property = options.properties[i];
        if (property.composite !== undefined) {
          this.properties.push(new CompositePropertyModel(property));
        } else {
          this.properties.push(new PropertyModel(property));
        }
        this.properties[i].Observer('changeType').subscribe(
          this.handleChangeType);
      }
      // sort PropertyModels alphabetically by name
      this.properties.sort(function (a, b) {
        var
          a_name = a && a.name() || '',
          b_name = b && b.name() || '';
          return a_name.localeCompare(b_name);
      });
    },

    /** Return an array of PropertyModel.name values in this Record */
    propertyNames: function() {
      var i, names = [];
      for (i = 0; i < this.properties.length; ++i) {
        names.push(this.properties[i].name());
      }
      return names;
    },

    /**
     * When any PropertyModel.type in this.properties changes this is run.
     * @param {string} published.name - Name of the PropertyModel being changed
     * @param {string} published.type - New type of the PropertyModel
     */
    handleChangeType: function(published) {
      this.Observer('changeType').publish({
        name: published.name,
        type: published.type
      });
    },

    /**
     * Search through this.properties and change a PropertyModel's type with
     * a given 'name' to 'type'
     * @param {string} name - Name of the PropertyModel being changed
     * @param {string} type - New type of the PropertyModel
     */
    changePropertyType: function(name, type) {
      var i;
      for (i = 0; i < this.properties.length; ++i) {
        if (this.properties[i].name() === name) {
          // Change PropertyModel.type. Set silent so we don't have
          // infinite publish/subscribe loop
          this.properties[i].type(type, {silent: true});
          break;
        }
      }
    }
  });

  return RecordModel;
});
