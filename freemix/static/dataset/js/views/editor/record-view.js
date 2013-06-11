/*global define */
define(['handlebars', 'jquery', 'views/modal-augment-view', 'text!templates/record.html', 'views/property-view'],
       function (Handlebars, $, ModalAugmentView, recordTemplate, PropertyView) {
  'use strict';
  /**
   * View of properties in a single record
   * @constructor
   * @param {string} options.model - instance of a RecordModel
   * @param {object} options.$el - container Element object for this view
   */
  var RecordView = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(RecordView.prototype, {
    initialize: function(options) {
      this.model = options.model;
      this.$el = options.$el;
      this.augmentModal = new ModalAugmentView({model: this.model});
      this.propertyViews = []
    },

    template: Handlebars.compile(recordTemplate),

    /** Add this view to the DOM */
    render: function() {
      var i, propertiesElement, propertyElement, propertyView;
      this.$el.html(this.template());
      this.$el.find('#add-property').on('click', (function() {
        this.augmentModal.$el.modal('show');
      }).bind(this));
      this.augmentModal.render();
      propertiesElement = this.$el.find('#properties');
      for (i = 0; i < this.model.properties.length; ++i) {
        propertyElement = $('<tr>');
        propertiesElement.append(propertyElement);
        propertyView = new PropertyView({
          $el: propertyElement,
          model: this.model.properties[i]
        });
        this.propertyViews.push(propertyView);
        propertyView.render();
      }
      return this;
    },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      var i;
      for (i = 0; i < this.propertyViews.length; ++i) {
        this.propertyViews[i].destroy();
      }
      this.augmentModal.destroy();

      this.$el.empty();
    }
  });

  return RecordView;
});
