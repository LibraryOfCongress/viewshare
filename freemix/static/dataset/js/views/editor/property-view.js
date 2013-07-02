/*global define */
define(['handlebars', 'jquery', 'text!templates/property.html'],
       function (Handlebars, $, propertyTemplate) {
  'use strict';
  /**
   * View of a single property on a record
   * @constructor
   * @param {string} options.model - instance of a PropertyModel
   * @param {object} options.$el - container Element object for this view
   */
  var PropertyView = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(PropertyView.prototype, {
    initialize: function(options) {
      this.model = options.model;
      this.$el = options.$el;
      // bind 'this' to template variables
      this.name.bind(this);
      this.type.bind(this);
      this.value.bind(this);
      this.selectedType.bind(this);
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(propertyTemplate),

    /** Compile the template we will use to render 'url' values */
    anchorTemplate: Handlebars.compile('<a href="{{ value }}">{{ value }}</a>'),

    /** Compile the template we will use to render 'image' values */
    imageTemplate: Handlebars.compile('<img src="{{ value }}" />'),

    /** Compile the template we will use as a default to render  values */
    textTemplate: Handlebars.compile('{{ value }}'),

    /** Event handler when a .name input is changed */
    changeNameHandler: function(event) {
      this.model.name(event.target.value);
    },

    /** Event handler when a .types input is changed */
    changeTypeHandler: function(event) {
      var newType = $(event.target).find(':selected').val(),
      valueEl = this.$el.find('.value'),
      valueTemplate;
      this.model.type(newType);
      // change rendering for this.model.value on certain types
      if (newType === 'image') {
        valueEl.html(this.imageTemplate({value: this.model.value}));
      } else if ( newType === 'url') {
        valueEl.html(this.anchorTemplate({value: this.model.value}));
      } else {
        valueEl.html(this.textTemplate({value: this.model.value}));
      }
    },

    /** Add this view to the DOM */
    render: function() {
      this.$el.html(this.template(
        $.extend(this, {
          selectedType: this.selectedType()
        })
      ));
      // bind to DOM events
      this.$el.find('.name input').on(
        'change', this.changeNameHandler.bind(this));
      this.$el.find('.types select').on(
        'change', this.changeTypeHandler.bind(this));
      return this;
    },

    /** Shortcut to PropertyModel.name for easy templating */
    name: function() { return this.model.name(); },

    /** Shortcut to PropertyModel.type for easy templating */
    type: function() { return this.model.type(); },

    /** Shortcut to PropertyModel.value for easy templating */
    value: function() { return this.model.value; },
    
    /** Our logic-less templates use this to mark
     * a 'type' <option> as selcted */
    selectedType: function() {
      var selected = {
        text: false,
        url: false,
        image: false,
        date: false,
        location: false,
        number: false};
      selected[this.type()] = true;
      return selected;
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      var inputs = this.$el.find('.name input'),
      types = this.$el.find('.types select');
      inputs.off('change');
      types.off('change');
      this.$el.empty();
    }
  });

  return PropertyView;
});
