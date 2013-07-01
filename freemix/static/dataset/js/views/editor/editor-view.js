/*global define */
define(
  [
    'handlebars',
    'jquery',
    'models/record-collection',
    'views/modal-augment-view',
    'views/record-view',
    'text!templates/editor.html'
  ], function (
    Handlebars,
    $,
    RecordCollection,
    ModalAugmentView,
    RecordView,
    editorTemplate
  ) {
  'use strict';
  /**
   * High-level view of records that have properties that can be edited
   * @constructor
   * @param {string} options.model - instance of a RecordCollection
   * @param {object} options.$el - container Element object for this view
   * @param {object} options.notificationView - View used to
   * render notifications
   */
  var EditorView = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(EditorView.prototype, {
    initialize: function(options) {
      this.model = options.model;
      this.$el = options.$el;
      this.notificationView = options.notificationView;
      // child views
      this.augmentModal = new ModalAugmentView({model: this.model});
      this.recordView = {destroy: $.noop};
      // bind 'this' to template variables and event handlers
      this.currentRecordNumber.bind(this);
      this.totalRecords.bind(this);
      this.refreshURL.bind(this);
      this.render = this.render.bind(this);
      this.changeCurrentRecordNumber = this.changeCurrentRecordNumber.bind(this);
      this.renderPreviousRecord = this.renderPreviousRecord.bind(this);
      this.renderNextRecord = this.renderNextRecord.bind(this);
      this.handleSaveSuccess = this.handleSaveSuccess.bind(this);
      // events
      this.model.Observer('loadSuccess').subscribe(this.render);
      this.model.Observer('saveSuccess').subscribe(this.handleSaveSuccess);
      this.saveSuccessNotification = this.notificationView.addSubscription(
        this.model,
        'saveSuccess',
        'success',
        'Any changes or augmentations you made to your data have been saved to the server.',
        'Data saved successfully!');
      this.model.Observer('changeCurrentRecord').subscribe(
        this.changeCurrentRecordNumber
      );
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(editorTemplate),

    /**
     * Add this view to the DOM
     * @param {bool} options.fullRender - There are instances, such as after
     * a save, where we just want to render the ChildrenViews
     */
    render: function() {
      var nextRecord, prevRecord, save;
      // display EditorView
      this.$el.html(this.template(this));
      if (this.totalRecords()) {
        this.augmentModal.render();
        // bind to DOM actions
        prevRecord = this.$el.find('#prev-record');
        prevRecord.on('click', this.renderPreviousRecord.bind(this));
        nextRecord = this.$el.find('#next-record');
        nextRecord.on('click', this.renderNextRecord.bind(this));

        this.$el.find('#add-property').on('click', (function() {
          this.augmentModal.$el.modal('show');
        }).bind(this));


        save = this.$el.find('#save_button');
        save.on('click', this.model.save.bind(this.model));
        this.renderChildrenViews.apply(this, arguments);
      }
      return this;
    },

    renderChildrenViews: function() {
      // display RecordView
      this.recordView = new RecordView({
        model: this.model.currentRecord(),
        $el: this.$el.find('#records')});
      this.recordView.render.apply(this.recordView);
      // display notifications on record actions
      // TODO pass this.notificationView to augmentModal to handle
      // its own notifications
//      this.notificationFunc = this.notificationView.addSubscription(
//        this.recordView.augmentModal.newProperty,
//        'syncSuccess',
//        'success',
//        'New data has been created which you can use in your views.',
//        'Property created successfully!');
    },

    changeCurrentRecordNumber: function() {
      var current = this.$el.find('#current-record-number');
      current.html(this.currentRecordNumber());
    },

    /** Returns current record number for easy templating */
    currentRecordNumber: function() { return this.model._currentRecord + 1; },

    /** Shortcut to EditoryView._currentRecord for easy templating */
    totalRecords: function() { return this.model.records.length; },

    /** Returns URL for refreshing DataSource for easy templating */
    refreshURL: function() { return this.model.refreshURL; },

    /** Event handler to display the previous record */
    renderPreviousRecord: function(event) {
      this.destroyChildren();
      this.model.changeCurrentRecord(-1);
      this.renderChildrenViews();
      return false;
    },

    /** Event handler to display the previous record */
    renderNextRecord: function(event) {
      this.destroyChildren();
      this.model.changeCurrentRecord(1);
      this.renderChildrenViews();
      return false;
    },

    /** Event handler for a successful save event */
    handleSaveSuccess: function () {
      // TODO: loading gif
      this.destroyChildren();
      this.model.loadLocal.apply(this.model, [])
      this.renderChildrenViews();
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      if (this.totalRecords()) {
        var prevRecord = this.$el.find('#prev-record'),
        nextRecord = this.$el.find('#next-record'),
        save = this.$el.find('#save_button');
        // remove DOM events
        prevRecord.off('click');
        nextRecord.off('click');
        save.off('click');
        // remove model events
        this.model.Observer('loadSuccess').unsubscribe(this.render);
        this.model.Observer('changeCurrentRecord').unsubscribe(
          this.changeCurrentRecordNumber);
        this.notificationView.removeSubscription(
          this.model,
          'saveSuccess',
          this.saveSuccessNotification
        );
        // remove child views
        this.augmentModal.destroy();
        this.destroyChildren();
      }
      // clear DOM
      this.$el.empty();
    },

    /** Remove event bindings, child views, and DOM elements created
     * in 'renderChildren'
     */
    destroyChildren: function() {
      this.recordView.destroy();
    }
  });
  return EditorView;
});
