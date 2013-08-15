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
   * @param {object} options.model - RecordCollection we're augmenting
   * @param {object} options.notificationView - View used to
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
      this.notificationView = options.notificationView;
      this.listView = {destroy: $.noop};
      this.mapView = {destroy: $.noop};
      this.timelineView = {destroy: $.noop};
      // events
      this.model.Observer('loadSuccess').subscribe(this.render);
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(modalAugmentTemplate),

    render: function() {
      $('body').append(this.$el);
      // render children
      this.listView = new ListAugmentView({
        $el: this.$el.find('#list'),
        model: this.model.records[0]
      });
      this.mapView = new MapAugmentView({
        $el: this.$el.find('#map'),
        model: this.model.records[0]
      });
      this.timelineView = new TimelineAugmentView({
        $el: this.$el.find('#timeline'),
        model: this.model.records[0]
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

    /** Actions to take on a successful augmentation */
    augmentSuccess: function(data, textStatus, XMLHttpRequest) {
      var augmentErrors = data.failed || {};
      var augmentedProperties = [];
      this.model.Observer('augmentSuccess').publish();
    },

    /** Actions to take on an augmentation server error */
    augmentFailure: function(XMLHttpRequest, textStatus, errorThrown) {
      this.model.Observer('augmentFailure').publish();
    },

    /** Handle the 'Create Property' button click by augmenting data */
    createProperty: function(event) {
      var activeTab = this.$el.find('.tab-content .active');
      var errorList = this.$el.find('#augment-errors');
      var errors = {};
      var newProperty, postData;
      // validate tab's view's Model
      errorList.empty();
      if (activeTab.attr('id') === 'timeline') {
        newProperty = this.timelineView.newCompositeProperty;
      } else if (activeTab.attr('id') === 'map') {
        newProperty = this.mapView.newCompositeProperty;
      } else if (activeTab.attr('id') === 'list') {
        newProperty = this.listView.newCompositeProperty;
      } else {
        console.log(activeTab);
        return false;
      }
      // TODO: get a list of property names (through .propertyNames?)
      errors = newProperty.validate(this.model.propertyNames());
      if ($.isEmptyObject(errors)) {
        // TODO: post to contracted DraftExhibit API
        postData = {};
        $.ajax({
          url: "/augment/transform/",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(postData),
          success: this.augmentSuccess.bind(this),
          error: this.augmentFailure.bind(this),
          processData: false,
          dataType: "json"
        });
        this.$el.modal('hide');
      } else {
        // display client-side form validation errors
        this.$el.find('.modal-body').animate({ scrollTop: 0}, 'fast');
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
