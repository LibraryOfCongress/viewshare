/*global define */
define(['jquery', 'observer'], function ($, Observer) {
    'use strict';

    /**
     * Contains the data needed to create a support issue
     * in the event of an augmentation error
     * @param {string} options.contactType - 'email'|'phone'
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
            this.contactType = options.contactType || 'email';
            this.contactEmail = options.contactEmail;
            this.contactPhone = options.contactPhone;
            this.profileJSON = options.profileJSON || '{}';
            this.fieldName = options.fieldName;
            this.comments = options.comments;
        },

        /** Send this Property's attributes to the server to be saved */
        postAugmentationIssue: function() {
            var xhr = $.ajax({
                type: "POST",
                url: '/support/issue/augmentation/',
                data: JSON.stringify(this.toJSON())
            })
            .done(this.postAugmentationIssueSuccess.bind(this))
            .fail(this.postAugmentationIssueError.bind(this));
            return xhr;
        },

        /**
         * Succeeded in sending property attributes to the server
         * @param {object} successJSON - values for this property
         */
        postAugmentationIssueSuccess: function(successJSON) {
            this.Observer('postAugmentationIssueSuccess').publish();
        },

        /** Failed while sending property attributes to the server */
        postAugmentationIssueError: function(jqxhr, textStatus, error) {
            this.Observer('postAugmentationIssueError').publish(
                {status: textStatus, error: error});
        },

        /** Return a simple object representation of this Property */
        toJSON: function() {
            var jsonified = {};
            jsonified.contact_type = this.contactType;
            jsonified.contact_email = this.contactEmail;
            jsonified.contact_phone = this.contactPhone;
            jsonified.profile_json = this.profileJSON;
            jsonified.field_name = this.fieldName;
            jsonified.comments = this.comments;
            return jsonified;
        }
    });

    return AugmentationSupportIssueModel;
});

