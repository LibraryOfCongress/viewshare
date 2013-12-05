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
     * @param {object} options.model - PropertyCollection we're augmenting
     * @param {object} options.model - PropertyCollection we're augmenting
     * render notifications
     */
    var AugmentationSupportIssueView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(AugmentationSupportIssueView.prototype, {
        initialize: function(options) {
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(augmentationSupportIssueTemplate),

        render: function() {
           this.$el.html(this.template({
           }));
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            this.listView.destroy();
            this.mapView.destroy();
            this.timelineView.destroy();
            this.$el.remove();
        }
    });

    return AugmentationSupportIssueView;
});
