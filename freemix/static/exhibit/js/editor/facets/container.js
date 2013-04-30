(function($, Freemix) {
    "use strict";


    Freemix.facet.container.findWidget = function() {
        if (!this._selector) {
            this._selector = $(".facet-container#" + this.id, Freemix.getBuilder());
        }
        return this._selector;
    };

    Freemix.facet.container.serialize = function() {
        var config = [];
        this.findWidget().find(".facet").each(function() {
             var data = $(this).data("model");
             config.push(data.serialize());
        });
        return config;
    };

    Freemix.facet.container.addFacet = function(facet) {
        facet.findWidget().appendTo(this.findWidget());
        facet.refresh();
        Freemix.getBuilder().on("freemix.show-builder", function() {
            facet.refresh();
        });

    };

    Freemix.facet.container.getDialog = function() {
        return this._dialog;
    };

    Freemix.facet.container.getPopupContent = function() {
        var fc = this;

        var chooserThumbnails = $("<div><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h3 id='addWidgetModalLabel'>Select Facet Widget</h3></div></div>");

        $("<div class='chooser modal-body'></div>").freemixThumbnails(Freemix.facet.prototypes, function(Facet) {
            var facet = new Facet();

            if (!facet.config.id) {
                facet.config.id = $.make_uuid();
            }
            fc.findWidget().one("edit-facet", function() {
                fc.addFacet(facet);
            });
            facet.showEditor(fc);
        }).appendTo(chooserThumbnails);

        return chooserThumbnails;
    };

    Freemix.facet.container.getPopupButton = function() {
        return this.findWidget().find(".create-facet-button");
    };

})(window.Freemix.jQuery, window.Freemix);
