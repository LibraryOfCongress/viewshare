/*global define */
define(['handlebars', 'jquery', 'text!templates/modal.html', 'bootstrap'],
       function (Handlebars, $, modalTemplate) {
  'use strict';
  /**
   * View to display modals. 
   * @constructor
   * @param {string} options.header - string to use modal header
   * @param {string} options.body - string to use for modal body
   * @param {string} options.buttonText - (optional) string to use for button
   * text in footer
   * @param {function} options.buttonFunction - (optional) function to run
   * when button in footer is clicked
   */
  var ModalView = function(options) {
    this.initialize.apply(this, [options]);
  };

  $.extend(ModalView.prototype, {
    initialize: function(options) {
      this.$el = $(this.template({
        header: new Handlebars.SafeString(options.header),
        body: new Handlebars.SafeString(options.body),
        buttonText: options.buttonText}));
      if (typeof(options.buttonFunction) == 'function') {
        this.$el.find('#modalButton').on('click', this, options.buttonFunction);
      }
    },

    /** Compile the template we will use to render the View */
    template: Handlebars.compile(modalTemplate),

    /** Add view to the DOM */
    render: function() { $('body').append(this.$el); },

    /** Remove event bindings, child views, and DOM elements */
    destroy: function() {
      this.$el.remove();
    }
  });

  return ModalView;
});
