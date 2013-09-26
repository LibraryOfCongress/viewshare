/*global define */
define(
    [
        'handlebars',
        'jquery',
        'text!templates/modal-augment.html',
        'views/list-augment-view',
        'views/map-augment-view',
        'views/modal-view',
        'views/timeline-augment-view',
        'bootstrap',
        'jquery.csrf'
    ], function (
        Handlebars,
        $,
        modalAugmentTemplate,
        ListAugmentView,
        MapAugmentView,
        ModalView,
        TimelineAugmentView
    ) {
    'use strict';
    /**
     * Specialized ModalView which displays modal used to add augmented
     * properties to a dataset.
     * @constructor
     * @param {object} options.model - PropertyCollection we're augmenting
     * render notifications
     */
    var ModalAugmentView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(ModalAugmentView.prototype, {
        initialize: function(options) {
            var body = this.template();
            this.model = options.model;
            this.$el = new ModalView({
                header: 'Data Augmentation',
                body: body,
                buttonText: 'Create Property',
                buttonFunction: this.createProperty.bind(this)
            }).$el;
            this.listView = {destroy: $.noop};
            this.mapView = {destroy: $.noop};
            this.timelineView = {destroy: $.noop};
            // events
            this.model.Observer('loadSuccess').subscribe(
                this.render.bind(this)
            );
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(modalAugmentTemplate),

        render: function() {
            $('body').append(this.$el);
            // render children
            this.listView = new ListAugmentView({
                $el: this.$el.find('#list'),
                propertyCollection: this.model
            });
            this.mapView = new MapAugmentView({
                $el: this.$el.find('#map'),
                propertyCollection: this.model
            });
            this.timelineView = new TimelineAugmentView({
                $el: this.$el.find('#timeline'),
                propertyCollection: this.model
            });
            this.listView.render();
            this.mapView.render();
            this.timelineView.render();
        },

        /** Display a validation error
         * @param {string} errorText - Error text to display
         */
        renderValidationError: function(errorText) {
            var errorList = this.$el.find('#augment-errors'),
            error = $('<li>');
            error.html(errorText);
            errorList.append(error);
        },

        /** Handle the 'Create Property' button click by augmenting data */
        createProperty: function(event) {
            var activeTab = this.$el.find('.tab-content .active');
            var errorList = this.$el.find('#augment-errors');
            var errors = {};
            var newProperty;
            // validate tab's view's Model
            errorList.empty();
            if (activeTab.attr('id') === 'timeline') {
                newProperty = this.timelineView.newCompositeProperty;
            } else if (activeTab.attr('id') === 'map') {
                newProperty = this.mapView.newCompositeProperty;
            } else if (activeTab.attr('id') === 'list') {
                newProperty = this.listView.newPatternProperty;
            } else {
                console.log(activeTab);
                return false;
            }
            errors = newProperty.validate(this.model.propertyLabels());
            if ($.isEmptyObject(errors)) {
                this.$el.modal('hide');
                return newProperty.updateProperty()
                .done(newProperty.augmentData.bind(newProperty));
            } else {
                // display client-side form validation errors
                this.$el.find('.modal-body').animate({scrollTop: 0}, 'fast');
                if (errors.hasOwnProperty('name')) {
                    this.renderValidationError(errors.name);
                }
                if (errors.hasOwnProperty('composite')) {
                    this.renderValidationError(errors.composite);
                }
                return false;
            }
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            this.listView.destroy();
            this.mapView.destroy();
            this.timelineView.destroy();
            this.$el.remove();
        }
    });

    return ModalAugmentView;
});
