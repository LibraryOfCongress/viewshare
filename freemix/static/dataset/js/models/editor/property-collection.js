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
      var id, property,
      ignored_properties = [
        'id',
        'label',
        'modified',
        'uri',
        'type',
        'change',
        'changedItem',
      ];
      this.properties = [];
      // create editor models
      for (id in profile) {
        if (ignored_properties.indexOf(id) === -1) {
          property = profile[id];
          // TODO: check for augmented types
          this.properties.push(new PropertyModel({
            id: id,
            label: property.label,
            type: property.valueType,
            items: [],
            owner: this.owner,
            slug: this.slug
          }).load());
        } 
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
