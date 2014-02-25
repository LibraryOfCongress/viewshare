define(["jquery",
	"handlebars",
	"text!templates/layout/modal-save-cancel.html",
        "bootstrap"
	],
       
       function($, Handlebars, modal_text) {
	   "use strict";
	   
	   function ModalLinksView (options) {
	       this.selectors = options.selectors;	
	   }
	   
	   ModalLinksView.prototype.render = function() {
	       $(this.selectors).on("click", this.clickhandler.bind(this));	       
	   }
	   
	   ModalLinksView.prototype.destroy = function() {
	       $(this.selectors).off("click", this.clickhandler.bind(this));
	   }
	   
	   ModalLinksView.prototype.clickhandler = function(event) {
	       
	       var template = this.template();

	       $(template).appendTo("body");
	       
	       $('#modalSaveCancel').modal("show");
	       $('#modalSaveCancel').on("hidden", function() {
		       $('#modalSaveCancel').remove();
		   });

	       return false;
	   }
	   
	   ModalLinksView.prototype.template = Handlebars.compile(modal_text);
	   
	   return ModalLinksView;
       });
