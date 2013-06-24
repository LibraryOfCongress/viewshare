/*global define */
define(['handlebars',
        'jquery',
        'text!templates/modal-augment.html',
        'views/map-augment-view',
        'views/modal-view',
        'bootstrap'],
       function (Handlebars,
        $,
        modalAugmentTemplate,
        MapAugmentView,
        ModalView) {
  'use strict';
  /**
   * Specialized ModalView which displays modal used to add augmented
   * properties to a dataset.
   * @constructor
   * @param {object} options.model - RecordModel we're augmenting
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
      this.mapView = new MapAugmentView({
        $el: this.$el.find('#map'),
        model: options.model
      });
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(modalAugmentTemplate),

    render: function() {
      $('body').append(this.$el);
      // render children
      this.mapView.render();
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

    /** */
    createProperty: function(event) {
      var activeTab = this.$el.find('.tab-content .active'),
      errorList = this.$el.find('#augment-errors'),
      errors = {},
      newProperty;
      // validate tab's view's Model
      errorList.empty();
      if (activeTab.attr('id') === 'timeline') {
      } else if (activeTab.attr('id') === 'map') {
        newProperty = this.mapView.newCompositeProperty;
      } else if (activeTab.attr('id') === 'list') {
      } else {
        console.log(activeTab);
        return false;
      }
      errors = newProperty.validate();
      if ($.isEmptyObject(errors)) {
        // extend Freemix database with new Model by calling Property model's createFreemixProperty()
        Freemix.property.add(newProperty.createFreemixProperty());
        // TODO: sync Freemix with server
        console.log(this);
        console.log(event);
        this.$el.modal('hide');
      } else {
        // display errors
        if (errors.hasOwnProperty('name')) {
          this.renderValidationError(errors['name']);
        }
        if (errors.hasOwnProperty('composite')) {
          this.renderValidationError(errors['composite']);
        }
        return false;
      }
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      this.mapView.destroy();
      this.$el.remove();
    }
  });

  return ModalAugmentView;
});
