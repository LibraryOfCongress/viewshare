/*global define */
define(
    [
       'handlebars',
       'jquery',
       'text!templates/property.html'
    ], function (
        Handlebars,
        $,
        propertyTemplate
    ) {
   'use strict';
   /**
    * View of a single property on a record
    * @constructor
    * @param {string} options.model - instance of a PropertyModel
    * @param {object} options.$el - container Element object
    * for this view
    */
   var PropertyView = function(options) {
       this.initialize.apply(this, [options]);
   };

   $.extend(PropertyView.prototype, {
       initialize: function(options) {
           this.model = options.model;
           this.$el = options.$el;
           // bind 'this' to template variables
           this.label.bind(this);
           this.type.bind(this);
           this.value.bind(this);
           this.selectedType.bind(this);
           this.renderValue.bind(this);
           this.render = this.render.bind(this);
           this.changeValueHandler = this.changeValueHandler.bind(this);
           // subscribe to model events
           this.model.Observer('changeCurrentItem').subscribe(
               this.changeValueHandler);
       },

       /** Compile the template we will use to render the View */
       template: Handlebars.compile(propertyTemplate),

       /** Compile the template we will use to render 'url' values */
       anchorTemplate: Handlebars.compile('<a href="{{ value }}">{{ value }}</a>'),

       /** Compile the template we will use to render 'image' values */
       imageTemplate: Handlebars.compile('<img src="{{ value }}" />'),

       /** Compile the default template for values */
       textTemplate: Handlebars.compile('{{ value }}'),

       /** Event handler when a .name input is changed */
       changeLabelHandler: function(event) {
           this.model.name(event.target.value);
           return this.model.updateProperty();
       },

       /** Event handler when a .types input is changed */
       changeTypeHandler: function(event) {
           var newType = $(event.target).find(':selected').val();
           this.model.type(newType);
           this.renderValue();
           return this.model.updateProperty();
       },

       /** Event handler for when the current record (value) changes */
       changeValueHandler: function(event) {
           this.renderValue();
           return false;
       },

       /** Re-render the value of the PropertyModel */
       renderValue: function() {
           var valueType = this.$el.find(':selected').val(),
           valueEl = this.$el.find('.value');
           valueEl.fadeOut();
           // change rendering for this.model.value on certain types
           if (valueType === 'image') {
               valueEl.html(this.imageTemplate({value: this.model.value}));
           } else if ( valueType === 'url') {
               valueEl.html(this.anchorTemplate({value: this.model.value}));
           } else {
               valueEl.html(this.textTemplate({value: this.model.value}));
           }
           valueEl.fadeIn();
       },

       /** Add this view to the DOM */
       render: function() {
           this.$el.html(this.template(
               $.extend(this, {selectedType: this.selectedType()})
           ));
           // bind to DOM events
           this.$el.find('.name input').on(
               'change', this.changeLabelHandler.bind(this));
           this.$el.find('.types select').on(
               'change', this.changeTypeHandler.bind(this));
           return this;
       },

       /** Shortcut to PropertyModel.label for easy templating */
       label: function() { return this.model.label(); },

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
           this.model.Observer('changeCurrentItem').unsubscribe(
               this.changeValueHandler);
           this.$el.empty();
       }
   });

   return PropertyView;
});
