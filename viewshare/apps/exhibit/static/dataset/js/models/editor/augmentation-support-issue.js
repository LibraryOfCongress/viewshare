/*global define */
define(['jquery', 'observer'], function ($, Observer) {
    'use strict';

    /**
     * Contains the data needed to create a support issue
     * in the event of an augmentation error
     * @param {string} options.exhibitSlug - slug of problematic exhibit
     * @param {string} options.contactType - 'email'|'phone'
     * @param {string} options.contactEmail - contact's email address
     * @param {string} options.contactPhone - contact's phone number
     * @param {string} options.comments - additional comments
     * @param {string} options.label - name of failed augmentation
     * @param {string} options.type - type of failed augmentation
     * @param {array} options.composite - composites of
     * failed augmentation
     */
    var AugmentationSupportIssueModel = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };

    $.extend(AugmentationSupportIssueModel.prototype, {
        initialize: function(options) {
            this.exhibitSlug = options.exhibitSlug;
            this.contactType = options.contactType || 'email';
            this.contactEmail = options.contactEmail;
            this.contactPhone = options.contactPhone;
            this.comments = options.comments;
            this.label = options.label;
            this.type = options.type;
            this.composite = options.composite;
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

        augmentDataFailureHandler: function(failedComposite) {
            this.label = failedComposite.label;
            this.type = failedComposite.type;
            this.composite = failedComposite.composite;
        },

        /** Return a simple object representation of this Property */
        toJSON: function() {
            var jsonified = {};
            jsonified.exhibit_slug = this.exhibitSlug;
            jsonified.contact_type = this.contactType;
            jsonified.contact_email = this.contactEmail;
            jsonified.contact_phone = this.contactPhone;
            jsonified.comments = this.comments;
            jsonified.label = this.label;
            jsonified.type = this.type;
            jsonified.composite = this.composite;
            return jsonified;
        }
    });

    return AugmentationSupportIssueModel;
});

