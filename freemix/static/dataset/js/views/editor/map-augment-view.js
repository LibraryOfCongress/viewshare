/*global define */
define(
  [
    'handlebars',
    'jquery',
    'models/composite-property',
    'text!templates/map-augment.html'
  ], function (
    Handlebars,
    $,
    CompositePropertyModel,
    mapAugmentTemplate,
  ) {
  'use strict';
  /**
   * View that can add a CompositeModel to a RecordCollection. This prepares
   * the RecordCollection to be sent to an Akara server for augmentation.
   * @constructor
   * @param {object} options.model - RecordModel we're augmenting
   */
  var ModalAugmentView = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(ModalAugmentView.prototype, {
    initialize: function(options) {
      this.model = options.model;
      this.newCompositeProperty = new CompositePropertyModel({
        id: undefined,
        name: undefined
        type: 'location',
        value: undefined
        composite: []
      });
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(mapAugmentTemplate),

    /** Event handler when a .name input is changed */
    changeNameHandler: function(event) {
      this.newCompositeProperty.name(event.target.value);
    },

    render: function() {
      this.$el.html(this.template({
        properties: this.model.properties,
      }));
      this.$el.find('.name input').on(
        'change', this.changeNameHandler.bind(this));
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      this.$el.find('.name input').off(
        'change', this.changeNameHandler.bind(this));
      this.$el.remove();
    }
  });

  return ModalAugmentView;
});
