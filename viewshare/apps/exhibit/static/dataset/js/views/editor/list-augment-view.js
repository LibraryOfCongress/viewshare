/*global define */
define(
    [
        'handlebars',
        'jquery',
        'models/pattern-property',
        'text!templates/list-augment.html'
    ], function (
        Handlebars,
        $,
        PatternPropertyModel,
        listAugmentTemplate
    ) {
    'use strict';
    /**
     * View that can add a PatternPropertyModel to a RecordCollection.
     * This prepares the RecordCollection to be sent to an Akara server
     * for augmentation.
     * @constructor
     * @param {object} options.propertyCollection - PropertyCollection
     * we're augmenting
     * @param {object} options.$el - container Element object for this view
     */
    var ListAugmentView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(ListAugmentView.prototype, {
        initialize: function(options) {
            this.propertyOptions = options.propertyCollection.toOptions();
            this.$el = options.$el;
            this.newPatternProperty = new PatternPropertyModel({
                id: undefined,
                label: undefined,
                type: 'text',
                value: [],
                augmentation: '',
                composite: [],
                property_url: options.propertyCollection.propertiesURL
            });
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(listAugmentTemplate),

        /** Event handler when a .name input is changed */
        changeNameHandler: function(event) {
            this.newPatternProperty.label = event.target.value;
            this.newPatternProperty.id(
                event.target.value.replace(' ', '_', 'g').toLowerCase());
        },

        /** Event handler when a .selected input is clicked */
        changeCompositeHandler: function(event) {
            var i = 0,
            selected = this.$el.find('.selected input:checked'),
            composites = [];
            for (i; i < selected.length; ++i) {
                composites.push(selected[i].value);
            }
            this.newPatternProperty.composite = composites;
        },

        /** Modify this.newPatternProperty.pattern based on user action */
        changePatternHandler: function(event) {
            this.newPatternProperty.augmentation = 'pattern-list';
            this.newPatternProperty.delimiter = null;
        },

        /** Modify this.newPatternProperty.delimiter based on user action */
        changeDelimiterHandler: function(event) {
            var newDelimiter = $(event.target).find(':selected').val();
            this.newPatternProperty.delimiter = newDelimiter;
            this.newPatternProperty.augmentation = 'delimited-list';
            this.newPatternProperty.pattern = null;
        },

        render: function() {
            this.$el.html(this.template(this));
            this.$el.find('#new-list-property').on(
                'change', this.changeNameHandler.bind(this));
            this.$el.find('#new-list-delimiter').on(
                'change', this.changeDelimiterHandler.bind(this));
            this.$el.find('.selected input').on(
                'click', this.changeCompositeHandler.bind(this));
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            this.$el.find('#new-list-property').off(
                'change', this.changeNameHandler.bind(this));
            this.$el.find('#new-list-pattern').off(
                'change', this.changeDelimiterHandler.bind(this));
            this.$el.find('.selected input').off(
                'click', this.changeCompositeHandler.bind(this));
            this.$el.remove();
        }
    });

    return ListAugmentView;
});
