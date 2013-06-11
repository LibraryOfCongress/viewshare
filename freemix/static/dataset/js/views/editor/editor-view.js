/*global define */
define([
       'handlebars',
       'jquery',
       'models/record-collection',
       'views/notification-view',
       'views/record-view',
       'text!templates/editor.html'],
       function (
         Handlebars,
         $,
         RecordCollection,
         NotificationView,
         RecordView,
         editorTemplate) {
  'use strict';
  /**
   * High-level view of records that have properties that can be edited
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
      this.notificationFunc = undefined;
      // child views
      this.notificationView = new NotificationView({$el: undefined});
      this.recordView = {destroy: $.noop}
      // bind 'this' to template variables and event handlers
      this.currentRecordNumber.bind(this);
      this.totalRecords.bind(this);
      this.render = this.render.bind(this)
      this.changeCurrentRecordNumber = this.changeCurrentRecordNumber.bind(this)
      // events
      this.model.Observer('loadSuccess').subscribe(this.render);
      this.model.Observer('changeCurrentRecord').subscribe(
        this.changeCurrentRecordNumber);
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(editorTemplate),

    /** Add this view to the DOM */
    render: function() {
      var nextRecord, prevRecord, save;
      // display EditorView
      this.$el.html(this.template(this));
      // assign element to NotificationView for notification display
      this.notificationView.$el = this.$el.find('#notifications');
      // bind to DOM actions
      prevRecord = this.$el.find('#prev-record');
      prevRecord.on('click', this.renderPreviousRecord.bind(this));
      nextRecord = this.$el.find('#next-record');
      nextRecord.on('click', this.renderNextRecord.bind(this));
      save = this.$el.find('#save_button');
      save.on('click', this.model.save.bind(this.model));
      this.renderChildrenViews.apply(this, arguments);
      return this;
    },

    renderChildrenViews: function() {
      // display RecordView
      this.recordView = new RecordView({
        model: this.model.currentRecord(),
        $el: this.$el.find('#records')});
      this.recordView.render.apply(this.recordView);
      // display notifications on record actions
      this.notificationFunc = this.notificationView.addSubscription(
        this.recordView.augmentModal.newProperty,
        'syncSuccess',
        'success',
        'New data has been created which you can use in your views.',
        'Property created successfully!');
    },

    changeCurrentRecordNumber: function() {
      var current = this.$el.find('#current-record-number');
      current.html(this.currentRecordNumber());
    },

    /** Returns current record number for easy templating */
    currentRecordNumber: function() { return this.model._currentRecord + 1; },

    /** Shortcut to EditoryView._currentRecord for easy templating */
    totalRecords: function() { return this.model.records.length; },

    /** Event handler to display the previous record */
    renderPreviousRecord: function(event) {
      this.model.changeCurrentRecord(-1);
      this.renderChildrenViews();
      return false;
    },

    /** Event handler to display the previous record */
    renderNextRecord: function(event) {
      this.model.changeCurrentRecord(1);
      this.renderChildrenViews();
      return false;
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      var prevRecord = this.$el.find('#prev-record'),
      nextRecord = this.$el.find('#next-record'),
      save = this.$el.find('#save_button');
      // remove DOM events
      prevRecord.off('click');
      nextRecord.off('click');
      save.off('click');
      this.notificationView.removeSubscription(
        this.recordView.augmentModal.newProperty,
        'syncSuccess',
        this.notificationFunc);
      // remove model events
      this.model.Observer('loadSuccess').unsubscribe(this.render);
      this.model.Observer('changeCurrentRecord').unsubscribe(
        this.changeCurrentRecordNumber);
      // remove child views
      this.recordView.destroy();
      this.notificationView.destroy();
      // clear DOM
      this.$el.empty();
    }
  });
  return EditorView;
});
