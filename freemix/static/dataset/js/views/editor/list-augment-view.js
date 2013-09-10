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
                owner: options.propertyCollection.owner,
                slug: options.propertyCollection.slug,
                augmentation: '',
                composite: []
            });
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(listAugmentTemplate),

        /** Event handler when a .name input is changed */
        changeNameHandler: function(event) {
            this.newPatternProperty.name(event.target.value);
        },

        /** Event handler when a .selcted input is clicked */
        changeCompositeHandler: function(event) {
            var i = 0,
            selected = this.$el.find('.selected input:checked'),
            composites = [];
            for (i; i < selected.length; ++i) {
                composites.push(selected[i].value);
            }
            this.newPatternProperty.composite(composites);
        },

        /** Modify this.newPatternProperty.delimiter based on user action */
        changeDelimiterHandler: function(event) {
            // TODO: Update this.augmentation to 'delimited-list'
            // Update this.delimiter.
        },

        /** Modify this.newPatternProperty.pattern based on user action */
        changePatternHandler: function(event) {
            // TODO: Update this.augmentation to 'pattern-list'
            // Update this.pattern.
        },

        render: function() {
            this.$el.html(this.template(this));
            this.$el.find('#new-list-property').on(
                'change', this.changeNameHandler.bind(this));
            this.$el.find('.selected input').on(
                'click', this.changeCompositeHandler.bind(this));
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            this.$el.find('.name input').off(
                'change', this.changeNameHandler.bind(this));
            this.$el.find('.selected input').off(
                'click', this.changeCompositeHandler.bind(this));
            this.$el.remove();
        }
    });

    return ListAugmentView;
});
