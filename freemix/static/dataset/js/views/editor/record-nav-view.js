/*global define */
define(
    [
        'handlebars',
        'jquery',
        'text!templates/record-nav.html'
    ], function (
        Handlebars,
        $,
        recordNavTemplate
    ) {
    'use strict';
    /**
     * Record navigation view that allows a user to change the visible
     * values in the property editor
     * @constructor
     * @param {string} options.model - instance of a RecordCollection
     * @param {object} options.$el - container Element object for this view
     */
    var RecordNavView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(RecordNavView.prototype, {
        initialize: function(options) {
            this.$el = options.$el;
            this.model = options.model;
            // events
            this.model.Observer('allLoadDataSuccess').subscribe(
                this.render.bind(this)
            );
            this.model.Observer('changeCurrentRecord').subscribe(
                this.changeCurrentRecordNumber.bind(this)
            );
        },
        /** Compile the template we will use to render the View */
        template: Handlebars.compile(recordNavTemplate),

        /** Event handler to change displayed current record number */
        changeCurrentRecordNumber: function() {
            var current = this.$el.find('#current-record-number');
            current.html(this.currentRecordNumber());
        },

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

        /** Returns current record number for easy templating */
        currentRecordNumber: function() {
            if (this.model.properties.length > 0) {
                return this.model.properties[0].currentItemIndex + 1;
            } else {
                return 0;
            }
        },

        /** Returns total record count for easy templating */
        totalRecordCount: function() {
            var count = 0;
            if (this.model.properties.length > 0) {
                if (this.model.properties[0].items.length > 0) {
                    count = this.model.properties[0].items.length;
                }
            }
            return count;
        },

        /** Add this view to the DOM */
        render: function() {
            // bind to DOM actions
            var prevRecord, nextRecord; 
            this.$el.html(this.template(this));
            prevRecord = this.$el.find('#prev-record');
            nextRecord = this.$el.find('#next-record');
            prevRecord.on('click', this.renderPreviousRecord.bind(this));
            nextRecord.on('click', this.renderNextRecord.bind(this));
        },

        destroy: function() {
            var prevRecord = this.$el.find('#prev-record'),
            nextRecord = this.$el.find('#next-record');
            // remove DOM events
            prevRecord.off('click');
            nextRecord.off('click');
            // remove model events
            this.model.Observer('changeCurrentRecord').unsubscribe(
                this.changeCurrentRecordNumber);
            this.$el.empty();
        }
    });
    return RecordNavView;
});
