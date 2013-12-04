define(["jquery",
        "exhibit/js/views/registry",
        "exhibit/js/facets/registry",
        "exhibit/js/lenses/registry",
        "freemix/js/freemix",
        "jquery.uuid"],
    function($, ViewRegistry, FacetRegistry, LensRegistry, Freemix) {    "use strict";

    var Container = function (id) {
        if (id) {
            this.id = id;
        }
    };

    Container.prototype.findWidget = function() {
        return $(".view-container#" + this.id, Freemix.getBuilder());
    };

    Container.prototype.getContent = function() {
        return $(".view-content", this.findWidget());
    };

    Container.prototype.serialize = function() {
        var config = [];
        $("ul.view-set>li", this.findWidget()).each(function() {
            if (!$(this).hasClass("create-view")) {
                var view = $(this).data("model");
                config.push(view.serialize());
            }
        });
        return config;
    };

    Container.prototype.addView = function(view) {
        $('.view-set li.create-view', this.findWidget()).before(view.findWidget());
    };

    Container.prototype.getSelected = function() {
        return this.findWidget().find(".view-set>li.ui-state-active");
    };

    Container.prototype.getDialog = function() {
        return this._dialog;
    };

    Container.prototype.getPopupContent = function() {
        var container = this;

        var chooserThumbnails = $("<div><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h3 id='addWidgetModalLabel'>Select View Widget</h3></div></div>");


        $("<div class='chooser modal-body'></div>")
            .freemixThumbnails(ViewRegistry.prototypes, function(View) {
                var view = new View();
                if (!view.config.id) {
                    view.config.id = $.make_uuid();
                }

                container.findWidget().one("edit-view", function() {
                    container.addView(view);
                });
                view.showEditor(container);
            }).appendTo(chooserThumbnails);
        return chooserThumbnails;
    };

    return Container;

});
