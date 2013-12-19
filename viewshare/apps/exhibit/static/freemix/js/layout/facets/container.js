define(["jquery",
        "display/facets/registry",
        "layout/widget_editor",
        "freemix/js/freemix",
        "jquery.uuid"],
    function($, FacetRegistry, WidgetEditor, Freemix) {
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
        this._dialog.empty();
        var editor = new WidgetEditor({
            "title": "Add Widget",
            "registry": FacetRegistry,
            "element": container._dialog,
            "switchable": true
        });

        editor.render();

        this._dialog.one("edit-widget", function(evt) {
            var model = editor.model;
            this.modal("hide");
            container.addFacet(model);
        }.bind(this._dialog));

    };

    return Container;
});
