define(["jquery",
        "display/views/registry",
        "display/facets/registry",
        "display/lenses/registry",
        "layout/widget_editor",
        "freemix/js/freemix",
        "jquery.uuid"],
    function($, ViewRegistry, FacetRegistry, LensRegistry, WidgetEditor, Freemix) {
    "use strict";

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
        this._dialog.empty();
        var editor = new WidgetEditor({
            "title": "Add View",
            "registry": ViewRegistry,
            "element": container.getDialog(),
            "switchable": true
        });

        editor.render();

        this.getDialog().off("edit-widget").one("edit-widget", function(evt) {
            var model = editor.model;
            this.modal("hide");
            container.addView(model);
        }.bind(this.getDialog()));

    };

    return Container;

});
