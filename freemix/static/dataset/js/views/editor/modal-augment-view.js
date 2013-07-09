/*global define */
define(
  [
    'freemix',
    'handlebars',
    'jquery',
    'text!templates/modal-augment.html',
    'views/map-augment-view',
    'views/modal-view',
    'views/timeline-augment-view',
    'bootstrap',
    'freemix.exhibit',
    'freemix.property',
    'freemix.identify',
    'jquery.csrf'
  ], function (
    Freemix,
    Handlebars,
    $,
    modalAugmentTemplate,
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
      this.mapView = {destroy: $.noop};
      this.timelineView = {destroy: $.noop};
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(modalAugmentTemplate),

    render: function() {
      $('body').append(this.$el);
      // render children
      this.mapView = new MapAugmentView({
        $el: this.$el.find('#map'),
        model: this.model.records[0]
      });
      this.timelineView = new TimelineAugmentView({
        $el: this.$el.find('#timeline'),
        model: this.model.records[0]
      });
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
      var augmentErrors = data.failed || {},
      augmentedProperties = [],
      freemixDatabase = Freemix.exhibit.database,
      freemixRemoveObjects = function(i, id) {
          freemixDatabase.removeObjects(id,p);
      },
      i = 0, p;
      // Add augmented data to Freemix database
      $.each(Freemix.property.propertyList, function(name, prop){
        if (prop.config.composite || prop.config.extract) {
          augmentedProperties.push(name);
        }
      });
      for (i; i < augmentedProperties.length ; i++) {
        p = augmentedProperties[i];
        $.each(freemixDatabase.getAllItems(), freemixRemoveObjects);
      }
      freemixDatabase.loadData({'items': data.items});
      // Add augmented data to record-collection
      this.model.Observer('augmentSuccess').publish(freemixDatabase);
      // Rerender editor
    },

    /** Actions to take on an augmentation server error */
    augmentFailure: function(XMLHttpRequest, textStatus, errorThrown) {
      this.notificationView.addNotification(
        'error',
        'There was a server error during the data augmentation. Please try again later.',
        'Augmentation Error!'
      );
    },

    /** Handle the 'Create Property' button click by augmenting data */
    createProperty: function(event) {
      var activeTab = this.$el.find('.tab-content .active'),
      errorList = this.$el.find('#augment-errors'),
      errors = {},
      freemixDatabase, newProperty, postData, propertyNames;
      // validate tab's view's Model
      errorList.empty();
      if (activeTab.attr('id') === 'timeline') {
        newProperty = this.timelineView.newCompositeProperty;
      } else if (activeTab.attr('id') === 'map') {
        newProperty = this.mapView.newCompositeProperty;
      } else if (activeTab.attr('id') === 'list') {
      } else {
        console.log(activeTab);
        return false;
      }
      errors = newProperty.validate(this.model.records[0].propertyNames());
      if ($.isEmptyObject(errors)) {
        // extend Freemix database with new Model by calling Property model's createFreemixProperty()
        Freemix.property.add(newProperty.createFreemixProperty());
        freemixDatabase = Freemix.exhibit.exportDatabase(
          Freemix.exhibit.database);
        postData = $.extend(
          {},
          freemixDatabase,
          {data_profile: Freemix.profile}
        );
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
      this.mapView.destroy();
      this.timelineView.destroy();
      this.$el.remove();
    }
  });

  return ModalAugmentView;
});
