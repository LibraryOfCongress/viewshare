/*global define */
define(
    [
        'handlebars',
        'jquery',
        'views/property-view',
        'views/record-nav-view',
        'views/view-interface',
        'text!templates/editor.html'
    ], function (
        Handlebars,
        $,
        PropertyView,
        RecordNavView,
        ViewInterface,
        editorTemplate
    ) {
    'use strict';
    /**
     * High-level view of properties that can be edited
     * @constructor
     * @param {string} options.model - instance of a RecordCollection
     * @param {object} options.$el - container Element object for this view
     */
    var EditorView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(EditorView.prototype, {
        initialize: function(options) {
            this.model = options.model;
            this.$el = options.$el;
            // child views
            this.propertyViews = [];
            this.recordNavView = null;
            // events
            this.model.Observer('loadSuccess').subscribe(
                this.render.bind(this)
            );
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(editorTemplate),

        /** Add this view to the DOM */
        render: function() {
            var i,
                newProperty,
                newPropertyEl,
                propertiesEl;
            // display EditorView
            this.$el.html(this.template(this));
            this.recordNavView = new RecordNavView({
                $el: this.$el.find('#record-nav'),
                model: this.model
            });
            if (this.propertyCount()) {
                propertiesEl = this.$el.find('#properties');
                for (i = 0; i < this.propertyCount(); ++i) {
                    newPropertyEl = $('<tr></tr>');
                    propertiesEl.append(newPropertyEl);
                    newProperty = new PropertyView({
                        model: this.model.properties[i],
                        $el: newPropertyEl
                    });
                    this.propertyViews.push(newProperty);
                }
                // bind to DOM actions
                this.$el.find('#add-property').on('click', (function() {
                    ViewInterface.Observer('showModal').publish();
                }).bind(this));
            }
            return this;
        },

        /** Shortcut to properties.length for this model */
        propertyCount: function() { return this.model.properties.length; },

        /** Returns URL for refreshing DataSource for easy templating */
        refreshURL: function() { return this.model.refreshURL; },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            // remove model events
            this.model.Observer('loadSuccess').unsubscribe(this.render);
            // remove child views
            for (i = 0; i < this.propertyCount(); ++i) {
                this.propertyViews[i].destroy();
            }
            this.recordNavView.destroy();
            // clear DOM
            this.$el.empty();
        }
    });
    return EditorView;
});
