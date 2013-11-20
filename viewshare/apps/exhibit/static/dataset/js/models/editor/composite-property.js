/*global define */
define(
    [
        'jquery',
        'models/property',
        'observer'
    ],
    function (
        $,
        PropertyModel,
        Observer
    ) {
    'use strict';

    /**
     * Extends PropertyModel. Represents a property that is created from other
     * properties such as a Latitude/Longitude pair.
     * @param {string} options.augmentation - augmentation type identifier
     * @param {array} options.composite - labels of other properties used to
     * create this CompositeProperty
     */
    var CompositePropertyModel = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };

    $.extend(CompositePropertyModel.prototype, PropertyModel.prototype, {
        initialize: function(options) {
            PropertyModel.prototype.initialize.apply(this, [options]);
            this.augmentation = options.augmentation;
            this.composite = options.composite;
        },

        /** Send this Property's attributes to the server to be saved */
        createProperty: function() {
            var xhr = $.ajax({
                type: "POST",
                url: this.propertyURL,
                data: JSON.stringify(this.toJSON())
            })
            .done(this.createPropertySuccess.bind(this))
            .fail(this.createPropertyError.bind(this));
            return xhr;
        },

        /**
         * Succeeded in sending property attributes to the server
         * @param {object} successJSON - values for this property
         */
        createPropertySuccess: function(successJSON) {
            var augmentXhr;
            if (successJSON.hasOwnProperty('property_url')) {
                this.propertyURL = successJSON.property_url;
            }
            if (successJSON.hasOwnProperty('data_url')) {
                this.dataURL = successJSON.data_url;
            }
            this.Observer('createPropertySuccess').publish();
            augmentXhr = this.augmentData();
            return augmentXhr;
        },

        /** Failed while sending property attributes to the server */
        createPropertyError: function(jqxhr, textStatus, error) {
            this.Observer('createPropertyError').publish(
                {status: textStatus, error: error});
        },

        /**
         * Request that this Property's attributes be augmented
         * on the server
         */
        augmentData: function() {
            var xhr = $.getJSON(this.dataURL)
            .done(this.augmentDataSuccess.bind(this))
            .fail(this.augmentDataFailure.bind(this));
            return xhr;
        },

        /**
         * Request for augmentation was received successfully.
         * Now we check for a completion status.
         * @param {object} successJSON - JSON related to successful request
         */
        augmentDataSuccess: function(successJSON) {
            var xhr;
            if ( successJSON && successJSON.hasOwnProperty('augmentation_status')) {
                this.statusURL = successJSON.augmentation_status;
            }
            xhr = $.getJSON(this.statusURL)
            .done(this.augmentStatusSuccess.bind(this))
            .fail(this.augmentStatusFailure.bind(this));
            return xhr;
        },

        /**
         * Request for status check was successful. Our reaction
         * depends on the response. We have either:
         * 1. augmented successfully
         * 2. augmented with errors
         * 3. not finished augmenting
         */
        augmentStatusSuccess: function(successJSON, textStatus, xhr) {
            if (xhr.status === 201) {
                this.dataURL = xhr.getResponseHeader('location');
                this.Observer('augmentDataSuccess').publish(this);
                this.loadData();
            } else if (xhr.status === 200) {
                // poll for status updates
                if ($.isEmptyObject(successJSON)) {
                    setTimeout(this.augmentDataSuccess.bind(this), 5000);
                } else {
                    // Server has failed gracefully unable to connect to Akara
                    this.Observer('augmentDataFailure').publish(
                        {status: textStatus, error: successJSON});
                }
            } else {
                // something unexpected happened
                this.augmentStatusFailure(
                    xhr, textStatus, 'Unexpected augmentStatusSuccess()');
            }
        },

        /**
         * Failed to check augmentation status on the server. This could
         * happen several ways. One way is that the transformation server
         * could be unresponsive. Another way is that the augmentation
         * status check happened before the AugmentTransaction was saved
         * to the database. In case of the latter, we check the server
         * this.statusFailureCountdown times.
         */
        augmentStatusFailure: function(jqxhr, textStatus, error) {
            if (this.statusFailureCountdown === 1) {
                this.Observer('augmentDataFailure').publish(
                    {status: textStatus, error: error});
            } else if (this.statusFailureCountdown === undefined) {
                this.statusFailureCountdown = 2;
                setTimeout(this.augmentDataSuccess.bind(this), 5000);
            } else {
                this.statusFailureCountdown -= 1;
                setTimeout(this.augmentDataSuccess.bind(this), 5000);
            }
        },

        /** Failed while sending property attributes to the server */
        augmentDataFailure: function(jqxhr, textStatus, error) {
            this.Observer('augmentDataFailure').publish(
                {status: textStatus, error: error}
            );
        },

        /**
        * Validate that the data in this Model is in a state where it could
        * be sent to a server.
        * @param {array} propertyNames - names that already exist and should not
        * be duplicated
        */
        validate: function(propertyNames) {
            var existingNames = propertyNames || [],
            errors = PropertyModel.prototype.validate.apply(this, [existingNames]);
            if (!this.composite.length) {
                errors.composite = 'Please select at least one property.';
            }
            return errors;
        },

        /** Return a simple object representation of this Property */
        toJSON: function() {
            var jsonProperty = PropertyModel.prototype.toJSON.apply(this, []);
            jsonProperty.augmentation = this.augmentation;
            jsonProperty.composite = this.composite;
            return jsonProperty;
        }
    });

    return CompositePropertyModel;
});
