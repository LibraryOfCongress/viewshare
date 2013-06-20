/*global define */
define(['handlebars', 'jquery', 'text!templates/composite-property.html'],
       function (Handlebars, $, compositePropertyTemplate) {
  'use strict';
  /**
   * View of a single CompositeProperty on a record.
   * @constructor
   * @param {string} options.model - instance of a CompositePropertyModel
   * @param {object} options.$el - container Element object for this view
   */
  var CompositePropertyView = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(CompositePropertyView.prototype, {
    initialize: function(options) {
      this.model = options.model;
      this.$el = options.$el;
      // bind 'this' to template variables
      this.name.bind(this);
      this.type.bind(this);
      this.value.bind(this);
      this.composite.bind(this);
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(compositePropertyTemplate),

    /** Add this view to the DOM */
    render: function() {
      this.$el.html(this.template({
        name: this.name(),
        type: this.type(),
        value: this.value(),
        composite: this.composite()
      }));
      // bind to DOM events
      this.$el.find('.name input').on(
        'change', this.changeNameHandler.bind(this));
      return this;
    },

    /** Event handler when a .name input is changed */
    changeNameHandler: function(event) {
      this.model.name(event.target.value);
    },

    /** Shortcut to CompositePropertyModel.name for templating */
    name: function() { return this.model.name(); },

    /** Shortcut to CompositePropertyModel.type for templating */
    type: function() {
      var modelType = this.model.type();
      modelType = modelType.charAt(0).toUpperCase() + modelType.slice(1);
      return modelType;
    },

    /** Shortcut to CompositePropertyModel.value for templating */
    value: function() { return this.model.value; },

    /** Shortcut to CompositePropertyModel.composite for templating */
    composite: function() { return this.model.composite; },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      this.$el.find('.name input').off(
        'change', this.changeNameHandler.bind(this));
      this.$el.empty();
    }
  });

  return CompositePropertyView;
});
