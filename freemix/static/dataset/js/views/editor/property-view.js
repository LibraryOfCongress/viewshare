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

    /** Event handler when a .name input is changed */
    changeNameHandler: function(event) {
      this.model.name(event.target.value);
    },

    /** Event handler when a .types input is changed */
    changeTypeHandler: function(event) {
      this.model.type($(event.target).find(':selected').val());
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
    
    /** Our logic-less templates use this to mark a
     * 'type' <option> as selcted */
    selectedType: function() {
      var selected = {
        text: false,
        url: false,
        image: false,
        date: false,
        location: false,
        number: false}
      selected[this.type()] = true;
      return selected;
    }
  });

  return PropertyView;
});
