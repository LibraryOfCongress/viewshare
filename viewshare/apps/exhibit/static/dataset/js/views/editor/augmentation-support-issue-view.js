/*global define */
define(
    [
        'handlebars',
        'jquery',
        'text!templates/augmentation-support-issue.html',
        'jquery.csrf'
    ], function (
        Handlebars,
        $,
        augmentationSupportIssueTemplate
    ) {
    'use strict';
    /**
     * Specialized ModalView which displays modal used to add augmented
     * properties to a dataset.
     * @constructor
     * @param {object} options.$el - DOM element View should be rendered in
     * @param {object} options.model - AugmentationSupportIssueModel
     * render notifications
     */
    var AugmentationSupportIssueView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(AugmentationSupportIssueView.prototype, {
        initialize: function(options) {
            this.$el = options.$el;
            this.model = options.model;
            this.$contactInput = undefined;
            this.$emailInput = undefined;
            this.$phoneInput = undefined;
            this.$commentsInput = undefined;
            this.animateDuration = 200;
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(augmentationSupportIssueTemplate),

        render: function() {
            this.$el.html(this.template({
            }));
            this.$el.find('a').on('click', this.showFormHandler.bind(this));
            this.$el.find('#augCreateIssue').on(
                'click', this.submitIssueHandler.bind(this));
            this.$contactInput = this.$el.find('#augContactInput');
            this.$contactInput.on('change', this.changeContactHandler.bind(this));
            this.$emailInput = this.$el.find('#augEmailInput');
            this.$emailInput.on('change', this.changeEmailHandler.bind(this));
            this.$phoneInput = this.$el.find('#augPhoneInput');
            this.$phoneInput.on('change', this.changePhoneHandler.bind(this));
            this.$commentsInput = this.$el.find('#augCommentsInput');
            this.$commentsInput.on(
                'change', this.changeCommentsHandler.bind(this));
        },

        /* Show the initally hidden support issue form */
        showFormHandler: function() {
            this.$el.find('#augmentationIssue').show(
                this.animateDuration, function() {
                    this.displayContactTypeInput();
                }.bind(this));
        },

        /* submit this.model to the server */
        submitIssueHandler: function() {
            this.model.postAugmentationIssue();
        },

        /**
         * Update AugmentationSupportIssue model's contact value and display
         * related input field
         */
        changeContactHandler: function() {
            this.model.contactType = this.$contactInput.val();
            this.displayContactTypeInput();
        },

        /* Update AugmentationSupportIssue model's email value */
        changeEmailHandler: function() {
            this.model.contactEmail = this.$emailInput.val();
        },

        /* Update AugmentationSupportIssue model's phone value */
        changePhoneHandler: function() {
            this.model.contactPhone = this.$phoneInput.val();
        },

        /* Update AugmentationSupportIssue model's comments value */
        changeCommentsHandler: function() {
            this.model.comments = this.$commentsInput.val();
        },

        /* Display the appropriate input fields for this view's $contactType */
        displayContactTypeInput: function() {
            if (this.model.contactType === 'email') {
                this.$el.find('#augPhone').hide(
                    this.animateDuration, function() {
                        this.$el.find('#augEmail').show(this.animateDuration);
                    }.bind(this));
            } else {
                this.$el.find('#augEmail').hide(
                    this.animateDuration, function() {
                        this.$el.find('#augPhone').show(this.animateDuration);
                    }.bind(this));
            }
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            this.$el.find('a').off('click');
            this.$el.find('#augCreateIssue').off('click');
            this.$contactInput.off('change');
            this.$emailInput.off('change');
            this.$phoneInput.off('change');
            this.$commentsInput.off('change');
            this.$el.remove();
        }
    });

    return AugmentationSupportIssueView;
});
