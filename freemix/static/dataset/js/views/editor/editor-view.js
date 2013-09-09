/*global define */
define(
    [
        'handlebars',
        'jquery',
        'views/property-view',
        'views/view-interface',
        'text!templates/editor.html'
    ], function (
        Handlebars,
        $,
        PropertyView,
        ViewInterface,
        editorTemplate
    ) {
    'use strict';
    /**
     * High-level view of properties that can be edited
     * @constructor
     * @param {string} options.model - instance of a RecordCollection
     * @param {object} options.$el - container Element object for this view
     * render notifications
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
            // bind 'this' to template variables and event handlers
            this.currentRecordNumber.bind(this);
            this.totalRecords.bind(this);
            this.refreshURL.bind(this);
            this.render = this.render.bind(this);
            this.changeCurrentRecordNumber = this.changeCurrentRecordNumber.bind(this);
            this.renderPreviousRecord = this.renderPreviousRecord.bind(this);
            this.renderNextRecord = this.renderNextRecord.bind(this);
            // events
            this.model.Observer('loadSuccess').subscribe(this.render);
            this.model.Observer('changeCurrentRecord').subscribe(
                this.changeCurrentRecordNumber
            );
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(editorTemplate),

        /** Add this view to the DOM */
        render: function() {
            var i, newProperty, newPropertyEl, nextRecord, prevRecord, propertiesEl;
            // display EditorView
            this.$el.html(this.template(this));
            if (this.totalRecords()) {
                propertiesEl = this.$el.find('#properties');
                for (i = 0; i < this.totalRecords(); ++i) {
                    newPropertyEl = $('<tr></tr>');
                    propertiesEl.append(newPropertyEl);
                    newProperty = new PropertyView({
                        model: this.model.properties[i],
                        $el: newPropertyEl
                    });
                    this.propertyViews.push(newProperty);
                }
                // bind to DOM actions
                prevRecord = this.$el.find('#prev-record');
                prevRecord.on('click', this.renderPreviousRecord.bind(this));
                nextRecord = this.$el.find('#next-record');
                nextRecord.on('click', this.renderNextRecord.bind(this));
                this.$el.find('#add-property').on('click', (function() {
                    ViewInterface.Observer.publish('showModal');
                }).bind(this));
            }
            return this;
        },

        changeCurrentRecordNumber: function() {
            var current = this.$el.find('#current-record-number');
            current.html(this.currentRecordNumber());
        },

        /** Returns current record number for easy templating */
        currentRecordNumber: function() {
            if (this.totalRecords() > 0) {
                return this.model.properties[0].currentItemIndex + 1;
            } else {
                return 0;
            }
        },

        /** Shortcut to EditoryView._currentRecord for easy templating */
        totalRecords: function() { return this.model.properties.length; },

        /** Returns URL for refreshing DataSource for easy templating */
        refreshURL: function() { return this.model.refreshURL; },

        /** Event handler to display the previous record */
        renderPreviousRecord: function(event) {
            this.model.changeCurrentRecord(-1);
            return false;
        },

        /** Event handler to display the next record */
        renderNextRecord: function(event) {
            this.model.changeCurrentRecord(1);
            return false;
        },

        /** Remove event bindings, child views, and DOM elements */
        destroy: function() {
            if (this.totalRecords()) {
                var prevRecord = this.$el.find('#prev-record'),
                nextRecord = this.$el.find('#next-record');
                // remove DOM events
                prevRecord.off('click');
                nextRecord.off('click');
                // remove model events
                this.model.Observer('loadSuccess').unsubscribe(this.render);
                this.model.Observer('changeCurrentRecord').unsubscribe(
                    this.changeCurrentRecordNumber);
                    // remove child views
                    for (i = 0; i < this.totalRecords(); ++i) {
                        this.propertyViews[i].destroy();
                    }
            }
            // clear DOM
            this.$el.empty();
        }
    });
    return EditorView;
});
