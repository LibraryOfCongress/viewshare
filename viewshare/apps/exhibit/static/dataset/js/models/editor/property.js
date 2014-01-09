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
     * Current types include:
     * * text
     * * URL
     * * image
     * * date/time
     * * location
     * * number
     * @param {array} options.items - Array of data values
     */
    var PropertyModel = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };

    $.extend(PropertyModel.prototype, {
        initialize: function(options) {
            this._id = options.id;
            this.label = options.label;
            this.type = options.type;
            this.items = options.items || [];
            this.currentItemIndex = null;
            if (options.hasOwnProperty('property_url')) {
                this.propertyURL = options.property_url;
            }
            if (options.hasOwnProperty('data_url')) {
                this.dataURL = options.data_url;
            }
        },

        /** Getter/Setter for this._id */
        id: function(value) {
            if (value) {
                this._id = value;
            }
            return this._id;
        },

        /** Return the current value from this.items. */
        currentItem: function() {
            if (this.currentItemIndex === null) {
                return {id: null, value: ""};
            } else {
                return this.items[this.currentItemIndex];
            }
        },

        /**
         * Filter a value from this.items with a specific id
         * @param {int} id - id of the this.items we wish to display
         */
        changeCurrentItem: function(id) {
            this.currentItemIndex = null;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == id) {
                    this.currentItemIndex = i;
                    break;
                }
            }
            this.Observer('changeCurrentItem').publish();
        },

        /** Pull this Property's attributes from the server */
        loadProperty: function() {
            var xhr = $.getJSON(this.propertyURL)
            .done(this.loadPropertySuccess.bind(this))
            .fail(this.loadPropertyError.bind(this));
            return xhr;
        },

        /**
         * Succeeded in getting property attributes from the server
         * @param {object} successJSON - values for this property
         */
        loadPropertySuccess: function(successJSON) {
            this.Observer('loadPropertySuccess').publish();
        },

        /** Failed while getting property attributes to the server */
        loadPropertyError: function(jqxhr, textStatus, error) {
            this.Observer('loadPropertyError').publish(
                {status: textStatus, error: error});
        },

        /** Send this Property's attributes to the server to be saved */
        updateProperty: function() {
            var xhr = $.ajax({
                type: "PUT",
                url: this.propertyURL,
                data: JSON.stringify(this.toJSON())
            })
            .done(this.updatePropertySuccess.bind(this))
            .fail(this.updatePropertyError.bind(this));
            return xhr;
        },

        /**
         * Succeeded in sending property attributes to the server
         * @param {object} successJSON - values for this property
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
         * @param {object} dataJSON - values for this property
         */
        loadDataSuccess: function(dataJSON) {
            var i, newItem;
            if (dataJSON.items.length > 0) {
                for (i = 0; i < dataJSON.items.length; ++i) {
                    newItem = {
                        id: dataJSON.items[i].id,
                        value: dataJSON.items[i][this._id]
                    };
                    this.items.push(newItem);
                }
                this.items.sort(function (a, b) {
                    var a_id = a && a.id || '',
                        b_id = b && b.id || '';
                    return a_id.localeCompare(b_id);
                });
            } else {
                // there are no items for this property
                this.items = [{
                    value: 'No value',
                    id: 0
                }];
            }
            this.Observer('loadDataSuccess').publish(this);
        },

        /** Failed while retrieving data for this property from the server */
        loadDataError: function(jqxhr, textStatus, error) {
            this.Observer('loadDataError').publish(
                {status: textStatus, error: error});
        },

        /**
         * Validate that the data in this Model is in a state where it could
         * be sent to a server.
         * @param {array} propertyLabels - labels that already exist and should
         * not be duplicated
         */
        validate: function(propertyLabels) {
            var errors = {};
            var existingNames = propertyLabels || [];
            if (!this.label) {
                errors.name = 'Please enter a name for the new property.';
            } else if (existingNames.indexOf(this.label) >= 0) {
                errors.name = 'Please enter a unique property name.';
            } else if (this.label.match(/[^\sa-zA-Z0-9]/)) {
                errors.name = 'Property name can only contain letters, numbers, and spaces.';
            }
            return errors;
        },

        /** Return a simple object representation of this Property */
        toJSON: function() {
            return {
                id: this._id,
                valueType: this.type,
                label: this.label
            };
        },

        /** Attempt to load data for this property from the server */
        deleteProperty: function() {
            console.log("Hook up delete on the backend")
        },

        /**
         * Load data for this model from successful JSON response
         * @param {object} dataJSON - values for this property
         */
        deletePropertySuccess: function(dataJSON) {
            this.Observer('deletePropertySuccess').publish(this);
        },

        /** Failed while deleting this property on the server */
        deletePropertyError: function(jqxhr, textStatus, error) {
            this.Observer('deletePropertyError').publish(
                {status: textStatus, error: error});
        },
    });

    return PropertyModel;
});
