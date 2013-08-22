/*global define */
define(
    [
        'jquery',
        'observer',
        'models/composite-property',
        'models/pattern-property',
        'models/property',
        'jquery.csrf'
    ],
    function (
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
     * @param {string} options.owner - URL to access type-related data
     * @param {string} options.slug - URL to access value-related data
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
         * Get JSON data to create a RecordCollection from the server
         */
        load: function() {
            var xhr = $.getJSON(this.profileURL)
            .done(this.loadSuccess.bind(this))
            .fail(this.loadFailure.bind(this));
            return xhr;
        },

        /**
         * Given 'profile' JSON describing the attributes all the properties
         * for this view, create Property models.
         */
        loadSuccess: function(profile) {
            var id, args, property;
            var ignored_properties = [
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
                    args = {
                        id: id,
                        label: property.label,
                        type: property.valueType,
                        items: [],
                        owner: this.owner,
                        slug: this.slug
                    };
                    if (property.hasOwnProperty('augmentation')) {
                        args.augmentation = property.augmentation;
                        args.composite = property.composite;
                        if (['date', 'location'].indexOf(property.augmentation) >= 0) {
                            this.properties.push(new CompositePropertyModel(args));
                        } else if (['pattern-list', 'delimited-list'].indexOf(
                                property.augmentation) >= 0) {
                            this.properties.push(new PatternPropertyModel(args));
                        }
                    } else {
                        this.properties.push(new PropertyModel(args));
                    }
                } 
            }
            // sort properties by label
            this.properties.sort(function (a, b) {
                var
                a_label = a && a.label || '',
                b_label = b && b.label || '';
                return a_label.localeCompare(b_label);
            });
            // load PropertyModel values
            for (i = 0; i < this.properties.length; ++i) {
                this.properties[i].loadData();
            }
            this.Observer('loadSuccess').publish();
        },

        /** Signal that the GET request failed */
        loadFailure: function(jqxhr, textStatus, error) {
            this.Observer('loadFailure').publish({status: textStatus, error: error});
        },

        /**
         * Change this._currentRecord by 'delta'. The result will always be
         * 0 <= this._currentRecord < this.records.length
         * @param delta {integer} - positive/negative number to increment/decrement
         */
        changeCurrentRecord: function(delta) {
            var i;
            for (i = 0; i < this.properties.length; ++i) {
                this.properties[i].changeCurrentItem(delta);
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
            var i;
            var options = [];
            var option = {};
            for (i = 0; i < this.properties.length; ++i) {
                option.id = this.properties[i].id;
                option.label = this.properties[i].label;
                options.push(option);
            }
            return options;
        }

    });
    return PropertyCollection;
});
