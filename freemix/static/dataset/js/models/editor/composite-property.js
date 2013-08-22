/*global define */
define(
    [
        'jquery',
        'models/property',
    ],
    function (
        $,
        PropertyModel
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
        this.initialize.apply(this, [options]);
    };

    $.extend(CompositePropertyModel.prototype, PropertyModel.prototype, {
        initialize: function(options) {
            PropertyModel.prototype.initialize.apply(this, [options]);
            this.augmentation = options.augmentation;
            this.composite = options.composite;
            this.statusURL =  + this.dataURL + '/status/';
        },

        /**
         * Request that this Property's attributes be augmented
         * on the server
         */
        augmentData: function() {
            var xhr = PropertyModel.prototype.loadData.apply(this, [])
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
            var xhr = $.getJSON(this.statusURL)
            .done(this.augmentStatusSuccess.bind(this))
            .fail(this.augmentStatusFailure.bind(this));
        },

        /**
         * Request for status check was successful. Our reaction
         * depends on the response. We have either:
         * 1. augmented successfully
         * 2. augmented with errors
         * 3. have not finished augmenting
         */
        augmentStatusSuccess: function(successJSON) {
            // TODO: replace the following pseudo-code
            if ('finished processing successfully' === 'true') {
                this.Observer('augmentDataSuccess').publish();
            } else if ('finished processing with errors' === 'true') {
                // TODO: research how we can error at this point
                this.Observer('augmentDataFailure').publish(
                    {status: 'insert status', error: 'insert error'}
                );
            } else if ('have not finished processing' === 'true') {
                // poll for status updates
                setTimeout(this.augmentDataSuccess.apply(this, []), 5000);
            }
        },

        /** Failed to check augmentation status on the server */
        augmentStatusFailure: function(jqxhr, textStatus, error) {
            this.Observer('augmentDataFailure').publish(
                {status: textStatus, error: error}
            );
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
