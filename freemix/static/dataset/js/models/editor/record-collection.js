/*global define */
define(
  [
    'freemix',
    'jquery',
    'observer',
    'models/record',
    'freemix.exhibit',
    'freemix.property',
    'freemix.identify',
    'jquery.csrf'
  ],
  function (
    Freemix,
    $,
    Observer,
    RecordModel) {
  'use strict';
  /**
   * Represents the collection of records in a DataSource
   * @constructor
   * @param {string} options.profileURL - URL to access type-related data for these Records
   * @param {string} options.dataURL - URL to access value-related data for these Records
   * @param {string} options.saveURL - URL used to POST updated property JSON
   */
  var
    RecordCollection = function(options) {
      this.initialize.apply(this, [options]);
    },
    RecordCollectionObserver = new Observer();

  $.extend(RecordCollection.prototype, RecordCollectionObserver, {
    initialize: function(options) {
      this.profileURL = options.profileURL;
      this.dataURL = options.dataURL;
      this.saveURL = options.saveURL;
      this.refreshURL = options.refreshURL;
      this.records = [];
      this._currentRecord = 0;
      this.currentRecord.bind(this);
      this.changeCurrentRecord.bind(this);
      this.Observer('augmentSuccess').subscribe(
        this.augmentSuccess.bind(this)
      );
    },

    createRecordModels: function(profile, data) {
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
      }
    },

    /**
     * When a RecordCollection is augmented we need to save the updated data
     * to the server and trigger a 'chance' event that can be used to render
     * related views.
     */
    augmentSuccess: function(freemixDatabase) {
      this.save();
    },

    /**
     * Build an array of {name, type, value} objects if our GET requests
     * for this.profileURL and this.dataURL succeeded
     */
    loadSuccess: function(profileJSON, dataJSON) {
      var properties = profileJSON[0].properties,
      data = dataJSON[0];
      // initialize Freemix
      Freemix.profile = {"properties": properties};
      Freemix.property.initializeDataProfile();
      Freemix.exhibit.initializeDatabase(data);
      this.createRecordModels(profileJSON, dataJSON);
      this.Observer('loadSuccess').publish(this);
    },

    /** Signal that the GET request failed */
    loadError: function(jqxhr, textStatus, error) {
      this.Observer('loadError').publish({status: textStatus, error: error});
    },

    /** Get JSON data to create a RecordCollection from the server */
    load: function() {
      $.when($.getJSON(this.profileURL), $.getJSON(this.dataURL))
        .then(this.loadSuccess.bind(this), this.loadError.bind(this));
    },

    /** Load records from the Freemix database */
    loadLocal: function() {
      var freemixDatabase = Freemix.exhibit.exportDatabase(
        Freemix.exhibit.database);
      this.createRecordModels([Freemix.profile], [freemixDatabase]);
    },

    /** Save new and modified properties to the server */
    saveSuccess: function(data) {
      this.Observer('saveSuccess').publish(this);
    },

    /** Signal that POST request to save has failed */
    saveError: function(jqxhr, textStatus, error) {
      this.Observer('saveError').publish({status: textStatus, error: error});
    },

    /** Save JSON data to create and modify a RecordCollection on the server */
    save: function() {
      var freemixDatabase, metadata, xhr;
      freemixDatabase = Freemix.exhibit.exportDatabase(
        Freemix.exhibit.database);
      metadata = $.extend({}, freemixDatabase, Freemix.profile);
      xhr = $.ajax({
        type: "POST",
        url: this.saveURL,
        data: JSON.stringify(metadata),
        success: this.saveSuccess.bind(this),
        error: this.saveError.bind(this)
      });
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
