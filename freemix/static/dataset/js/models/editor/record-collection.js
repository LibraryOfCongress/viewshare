/*global define */
define(['jquery', 'observer', 'models/record'], function ($, Observer, RecordModel) {
  'use strict';
  /**
   * Represents the collection of records in a DataSource
   * @constructor
   * @param {string} options.profileURL - URL to access type-related data for these Records
   * @param {string} options.dataURL - URL to access value-related data for these Records
   */
  var
    RecordCollection = function(options) {
      this.initialize.apply(this, [options]);
    },
    RecordCollectionObserver = Observer();

  $.extend(RecordCollection.prototype, RecordCollectionObserver, {
    initialize: function(options) {
      this.profileURL = options.profileURL;
      this.dataURL = options.dataURL;
      this.records = [];
      this._currentRecord = 0;
      this.currentRecord.bind(this);
      this.changeCurrentRecord.bind(this);
    },

    /**
     * Build an array of {name, type, value} objects if our GET requests
     * for this.profileURL and this.dataURL succeeded
     */
    syncSuccess: function(profileJSON, dataJSON) {
      var h, i, item, items, property, properties, record;
      properties = profileJSON[0].properties;
      items = dataJSON[0].items;
      for (i = 0; i < items.length; ++i) {
        record = [];
        item = items[i];
        for (h = 0; h < properties.length; ++h) {
          property = properties[h];
          record.push({
            name: property.label,
            type: property.types[0],
            value: item[property.property]
          });
        }
        this.records.push(new RecordModel({properties: record}));
      }
      this.Observer('syncSuccess').publish(this);
    },

    /**
     * Signal that the GET request failed
     */
    syncError: function(jqxhr, textStatus, error) {
      this.Observer('syncError').publish({status: textStatus, error: error});
    },

    /**
     * Get JSON data to create a RecordCollection from the server
     */
    sync: function() {
      $.when($.getJSON(this.profileURL), $.getJSON(this.dataURL))
        .then(this.syncSuccess.bind(this), this.syncError.bind(this));
    },

    /**
     * Change this._currentRecord by 'delta'. The result will always be
     * 0 <= this._currentRecord < this.records.length
     * @param delta {integer} - positive/negative number to increment/decrement
     */
    changeCurrentRecord: function(delta) {
      var current = this._currentRecord + delta;
      if (current < 0) {
        this._currentRecord = this.records.length + current;
      } else {
        this._currentRecord = current % this.records.length;
      }
      this.Observer('changeCurrentRecord').publish(this.currentRecord());
    },

    currentRecord: function() { return this.records[this._currentRecord]; }
  });
  return RecordCollection;
});
