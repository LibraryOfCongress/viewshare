/*global define */
define([
    'handlebars',
    'jquery',
    'models/composite-property',
    'text!templates/record.html',
    'views/composite-property-view',
    'views/property-view'
], function (
    Handlebars,
    $,
    CompositePropertyModel,
    recordTemplate,
    CompositePropertyView,
    PropertyView
) {
    'use strict';
    /**
     * View of properties in a single record
     * @constructor
     * @param {string} options.model - instance of a RecordModel
     * @param {object} options.$el - container Element object for this view
     */
    var RecordView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(RecordView.prototype, {
        initialize: function(options) {
            this.model = options.model;
            this.$el = options.$el;
            this.propertyViews = [];
        },

        template: Handlebars.compile(recordTemplate),

        /** Add this view to the DOM */
        render: function() {
            var i, propertiesElement, propertyElement,
                propertyModel, propertyView;
            this.$el.html(this.template());
            propertiesElement = this.$el.find('#properties');
            for (i = 0; i < this.model.properties.length; ++i) {
                propertyModel = this.model.properties[i];
                propertyElement = $('<tr>');
                propertiesElement.append(propertyElement);
                if (propertyModel instanceof CompositePropertyModel) {
                    propertyView = new CompositePropertyView({
                        $el: propertyElement,
                        model: propertyModel
                    });
                } else {
                    propertyView = new PropertyView({
                        $el: propertyElement,
                        model: propertyModel
                    });
                }
                this.propertyViews.push(propertyView);
                propertyView.render();
            }
            return this;
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            var i;
            for (i = 0; i < this.propertyViews.length; ++i) {
                this.propertyViews[i].destroy();
            }
            this.$el.empty();
        }
    });

    return RecordView;
});
