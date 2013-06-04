/*global define */
define(['handlebars',
        'jquery',
        'models/property',
        'text!templates/modal-augment.html',
        'views/modal-view',
        'bootstrap'],
       function (Handlebars,
        $,
        PropertyModel,
        modalAugmentTemplate,
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
      var body = this.template({
        properties: options.model.properties.sort(
          function (a, b) {
          var
            a_name = a && a.name || '',
            b_name = b && b.name || '';
            return a_name.localeCompare(b_name);
          }),
        propertyCount: options.model.properties.length
      });
      this.$el = new ModalView({
        header: 'Data Augmentation',
        body: body,
        buttonText: 'Create Property',
        buttonFunction: this.createProperty.bind(this)
      }).$el;
      this.newProperty = new PropertyModel({
        name: undefined,
        type: undefined,
        value: undefined
      });
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(modalAugmentTemplate),

    render: function() { $('body').append(this.$el); },

    createProperty: function(event) {
      console.log(this);
      console.log(event);
      this.newProperty.sync();
      this.$el.modal('hide');
    }
  });

  return ModalAugmentView;
});
