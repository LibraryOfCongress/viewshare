/*global define */
define([
    'jquery',
    'observer',
    'models/composite-property',
    'models/pattern-property',
    'models/property', 'jquery.csrf'
], function (
    $,
    Observer,
    CompositePropertyModel,
    PatternPropertyModel,
    PropertyModel
) {
    'use strict';
    /**
     * Represents the collection of Properties in a view
     * @constructor
     * @param {string} options.dataURL - URL to complete dataset
     * @param {string} options.propertiesURL - URL to the list of all properties
     */
    var PropertyCollection = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };
    var PropertyCollectionObserver = new Observer();

    $.extend(PropertyCollection.prototype, PropertyCollectionObserver, {
        initialize: function(options) {
            this.propertiesURL = options.propertiesURL;
            this.properties = [];
            this.currentItemIndex = null;
            this.itemIds = null;
        },

        /**
         * Get JSON data to create a RecordCollection from the server
         */
        load: function() {
            var xhr = $.getJSON(this.propertiesURL)
            .done(this.loadSuccess.bind(this))
            .fail(this.loadFailure.bind(this));
            return xhr;
        },

        /**
         * Given 'profile' JSON describing the attributes all the properties
         * for this view, create Property models.
         */
        loadSuccess: function(profile) {
            var args, i, id, property;
            var ignored_properties = [
                'id',
                'label',
                'modified',
                'uri',
                'type',
                'change',
                'changedItem'
            ];
            var loadDataPromises = [];
            this.properties = [];
            // create editor models
            for (id in profile.properties) {
                if (ignored_properties.indexOf(id) === -1) {
                    property = profile.properties[id];
                    args = {
                        id: id,
                        label: property.label,
                        type: property.valueType
                    };
                    if (property.hasOwnProperty('property_url')) {
                        args.property_url = property.property_url;
                    }
                    if (property.hasOwnProperty('data_url')) {
                        args.data_url = property.data_url;
                    }
                    if (property.hasOwnProperty('augmentation')) {
                        args.augmentation = property.augmentation;
                        args.composite = property.composite;
                        if (property.augmentation === 'composite') {
                            this.properties.push(
                                new CompositePropertyModel(args));
                        } else if (['pattern-list', 'delimited-list'].indexOf(
                                property.augmentation) >= 0) {
                            this.properties.push(
                                new PatternPropertyModel(args));
                        }
                    } else {
                        this.properties.push(new PropertyModel(args));
                    }
                }
            }
            // sort properties by label
            this.properties.sort(function (a, b) {
                var a_label = a && a.label || '',
                    b_label = b && b.label || '';
                return a_label.localeCompare(b_label);
            });
            // load PropertyModel values
            this.currentItemIndex = 0;
            for (i = 0; i < this.properties.length; ++i) {
                loadDataPromises.push(this.properties[i].loadData());
            }
            // publish notification that all properties have loaded their data
            $.when.apply(null, loadDataPromises).done(function() {
                // build an array of sorted, unique property item ids
                var item, j, i, set = {};
                this.itemIds = [];
                // create an object (working as a set) of item ids
                for (i = 0; i < this.properties.length; ++i) {
                    for (j = 0; j < this.properties[i].items.length; j++) {
                        item = this.properties[i].items[j];
                        if (!set.hasOwnProperty(item.id)) {
                            set[item.id] = true;
                            this.itemIds.push(item.id);
                        }
                    }
                }
                this.itemIds.sort();
                this.changeCurrentRecord(0);
                this.Observer('allLoadDataSuccess').publish();
            }.bind(this));
            this.Observer('loadSuccess').publish();
        },

        /** Signal that the GET request failed */
        loadFailure: function(jqxhr, textStatus, error) {
            this.Observer('loadFailure')
                .publish({status: textStatus, error: error});
        },

        /**
         * Change this._currentRecord by 'delta'. The result will always be
         * 0 <= this._currentRecord < this.records.length
         * @param delta {integer} - positive/negative number to
         *                          increment/decrement
         */
        changeCurrentRecord: function(delta) {
            var current, i;
            if (this.currentItemIndex === null || this.itemIds === null) {
                throw {message: 'Current item is null. Call this.loadData()'};
            }
            current = this.currentItemIndex + delta;
            if (current < 0) {
                this.currentItemIndex = this.itemIds.length + current;
            } else {
                this.currentItemIndex = current % this.itemIds.length;
            }

            for (i = 0; i < this.properties.length; ++i) {
                this.properties[i].changeCurrentItem(
                    this.itemIds[this.currentItemIndex]);
            }
            this.Observer('changeCurrentRecord').publish();
        },

        /** Return an array of this.properties labels */
        propertyLabels: function() {
            var labels = [];
            var i;
            for (i = 0; i < this.properties.length; ++i) {
                labels.push(this.properties[i].label);
            }
            return labels;
        },

        /** Return an array of {id: label} objects. Useful for <option> tags */
        toOptions: function() {
            var i, option;
            var options = [];
            for (i = 0; i < this.properties.length; ++i) {
                option = {
                    id: this.properties[i].id(),
                    label: this.properties[i].label
                };
                options.push(option);
            }
            return options;
        },

        /** Add a new property to this.properties */
        addProperty: function(newProperty) {
            if (this.properties.length > 0) {
                newProperty.currentItemIndex = this
                    .properties[0].currentItemIndex;
            }
            this.properties.push(newProperty);
            this.Observer('newProperty').publish(newProperty);
        },

        /**
         * Helper method used to trigger an 'augmentDataFailure' event.
         * This is useful for other models or views that need to bubble
         * up an augmentDataFailure event.
         */
        publishAugmentDataFailure: function(failedComposite) {
            this.Observer('augmentDataFailure').publish(failedComposite);
        }

    });
    return PropertyCollection;
});
