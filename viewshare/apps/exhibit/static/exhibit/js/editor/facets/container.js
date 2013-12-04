define(["jquery",
        "exhibit/js/facets/registry",
        "freemix/js/freemix",
        "jquery.uuid"],
    function($, FacetRegistry, Freemix) {
    "use strict";

    var Container = function(id) {
        if (id) {
            this.id = id;
        }
    };

    Container.prototype.findWidget = function() {
        if (!this._selector) {
            this._selector = $(".facet-container#" + this.id, Freemix.getBuilder());
        }
        return this._selector;
    };

    Container.prototype.serialize = function() {
        var config = [];
        this.findWidget().find(".facet").each(function() {
             var data = $(this).data("model");
             config.push(data.serialize());
        });
        return config;
    };

    Container.prototype.addFacet = function(facet) {
        facet.findWidget().appendTo(this.findWidget());
        facet.refresh();
        Freemix.getBuilder().on("freemix.show-builder", function() {
            facet.refresh();
        });

    };

    Container.prototype.getDialog = function() {
        return this._dialog;
    };

    Container.prototype.getPopupContent = function() {
        var container = this;

        var chooserThumbnails = $("<div><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h3 id='addWidgetModalLabel'>Select Facet Widget</h3></div></div>");

        $("<div class='chooser modal-body'></div>").freemixThumbnails(FacetRegistry.prototypes, function(Facet) {
            var facet = new Facet();

            if (!facet.config.id) {
                facet.config.id = $.make_uuid();
            }
            container.findWidget().one("edit-facet", function() {
                container.addFacet(facet);
            });
            facet.showEditor(container);
        }).appendTo(chooserThumbnails);

        return chooserThumbnails;
    };

    return Container;
});
