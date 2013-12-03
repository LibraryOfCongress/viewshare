/*global define */
define(['jquery', 'observer'], function ($, Observer) {
    'use strict';

    /**
     * Contains the data needed to create a support issue
     * in the event of an augmentation error
     * @param {string} options.preferredContact - 'email'|'phone'
     * @param {string} options.contactEmail - contact's email address
     * @param {string} options.contactPhone - contact's phone number
     * @param {string} options.profileJSON - JSON of related field
     * @param {string} options.fieldName - label of related field
     * @param {string} options.comments - additional comments
     */
    var AugmentationSupportIssueModel = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };

    $.extend(AugmentationSupportIssueModel.prototype, {
        initialize: function(options) {
            PropertyModel.prototype.initialize.apply(this, [options]);
            this.augmentation = options.augmentation;
            this.composite = options.composite;
            this.preferredContact = options.preferredContact;
            this.contactEmail = options.contactEmail;
            this.contactPhone = options.contactPhone;
            this.profileJSON = options.profileJSON;
            this.fieldName = options.fieldName;
            this.comments = options.comments;
        },

        /** Send this Property's attributes to the server to be saved */
        createAugmentationIssue: function() {
            var xhr = $.ajax({
                type: "POST",
                url: '/support/issue/augmentation/',
                data: JSON.stringify(this.toJSON())
            })
            .done(this.createAugmentationIssueSuccess.bind(this))
            .fail(this.createAugmentationIssueError.bind(this));
            return xhr;
        },

        /**
         * Succeeded in sending property attributes to the server
         * @param {object} successJSON - values for this property
         */
        createAugmentationIssueSuccess: function(successJSON) {
            this.Observer('createAugmentationIssueSuccess').publish();
        },

        /** Failed while sending property attributes to the server */
        createAugmentationIssueError: function(jqxhr, textStatus, error) {
            this.Observer('createAugmentationIssueError').publish(
                {status: textStatus, error: error});
        },

        /** Return a simple object representation of this Property */
        toJSON: function() {
            var jsonified = {};
            jsonified.augmentation = this.augmentation;
            jsonified.composite = this.composite;
            jsonified.preferredContact = this.preferredContact;
            jsonified.contactEmail = this.contactEmail;
            jsonified.contactPhone = this.contactPhone;
            jsonified.profileJSON = this.profileJSON;
            jsonified.fieldName = this.fieldName;
            jsonified.comments = this.comments;
            return jsonified;
        }
    });

    return AugmentationSupportIssueModel;
});

