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

    createProperty: function(event) {
      // TODO: determine active tab
      // TODO: validate tab's view's Model
      // TODO: extend Freemix database with new Model by calling Property model's createFreemixProperty()
      // TODO: sync Freemix with server
      console.log(this);
      console.log(event);
      this.$el.modal('hide');
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      this.mapView.destroy();
      this.$el.remove();
    }
  });

  return ModalAugmentView;
});
