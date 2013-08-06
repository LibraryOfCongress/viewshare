/*global define */
define(
  [
    'jquery',
    'observer',
    'models/property',
  ],
  function (
    $,
    Observer,
    PropertyModel
  ) {
  'use strict';
  /**
   * Represents the collection of Properties in a view
   * @constructor
   * @param {string} options.owner - URL to access type-related data for these Records
   * @param {string} options.slug - URL to access value-related data for these Records
   */
  var
    PropertyCollection = function(options) {
      this.initialize.apply(this, [options]);
    },
    PropertyCollectionObserver = new Observer();

  $.extend(PropertyCollection.prototype, PropertyCollectionObserver, {
    initialize: function(options) {
      this.owner = options.owner;
      this.slug = options.slug;
      this.properties = [];
    },

    /**
     * Given 'profile' JSON describing the attributes all the properties
     * for this view, create Property models.
     * TODO: Convert this to create PropertyModels
     */
    createPropertyModels: function(profile) {
      var h, i, item, property, record, type,
      properties = profile[0].properties,
      items = data[0].items,
      ignored_properties = [
        'id',
        'label',
        'modified',
        'uri',
        'type',
        'change',
        'changedItem',
      ];
      this.records = [];
      // create editor models
      for (i = 0; i < items.length; ++i) {
        record = [];
        item = items[i];
        for (h = 0; h < properties.length; ++h) {
          property = properties[h];
          if (ignored_properties.indexOf(property.property) === -1) {
            // this property is not one of our ignored_properties
            // decipher type
            if (property.tags.length > 0) {
              type = property.tags[0];
              type = type.match(/property:type=(\w+)/);
              type = type[1];
            } else if (property.types.length > 0) {
              type = property.types[0];
            } else {
              type = 'text';
            }
            record.push({
              id: property.property,
              name: property.label,
              type: type,
              value: item[property.property],
              composite: property.composite
            });
          } 
        }
        this.records.push(new RecordModel({properties: record}));
        this.records[i].Observer('changeType').subscribe(
          this.handleChangeType);
      }
    },

    /** Signal that the GET request failed */
    loadError: function(jqxhr, textStatus, error) {
      this.Observer('loadError').publish({status: textStatus, error: error});
    },

    /**
     * Get JSON data to create a RecordCollection from the server
     * TODO: define profileURL
     */
    load: function() {
      $.when($.getJSON(this.profileURL))
        .then(this.createPropertyModels.bind(this), this.loadError.bind(this));
    },

    /**
     * Change this._currentRecord by 'delta'. The result will always be
     * 0 <= this._currentRecord < this.records.length
     * @param delta {integer} - positive/negative number to increment/decrement
     */
    changeCurrentRecord: function(delta) {
      this.Observer('changeCurrentRecord').publish(delta);
    },

  });
  return PropertyCollection;
});
