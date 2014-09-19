define(["jquery",
        "handlebars",
        "display/facets/registry",
        "layout/widget_editor",
        "text!templates/layout/facet-container.html",
        "freemix/js/freemix",
        "jquery.uuid"],
    function($,
             Handlebars,
             FacetRegistry,
             WidgetEditor,
             template,
             Freemix) {
    "use strict";

    var Container = function(options) {
        this.id = options.id;
        this.element = options.element;
    };

    Container.prototype.template = Handlebars.compile(template);

    Container.prototype.render = function() {
        this.element.append(this.template({id: this.id}));

        this.element.data("model", this);
        this.element.sortable({
            group: 'facets',
            tolerance: 0,
            distance: 10,
            nested: false

        });
        this.dialog = this.element.find("#addWidgetModal_" + this.id);
        this.dialog.appendTo("body");

        this.dialog.modal({
            show:false
        });

        this.element.find(".create-facet").click(this.setupEditor.bind(this));
    };

    Container.prototype.serialize = function() {
        var config = [];
        this.element.find(".facet-set .facet").each(function() {
             var data = $(this).data("model");
             config.push(data.serialize());
        });
        return config;
    };

    Container.prototype.addFacet = function(facet) {
        this.element.find(".facet-set").append(facet.findWidget());
        facet.refresh();
        Freemix.getBuilder().on("freemix.show-builder", function() {
            facet.refresh();
        });

    };

    Container.prototype.setupEditor = function() {
        var container = this;
        this.dialog.empty();
        var editor = new WidgetEditor({
            "title": "Add Widget",
            "registry": FacetRegistry,
            "element": container.dialog,
            "switchable": true
        });

        editor.render();

        this.dialog.off("edit-widget").one("edit-widget", function(evt) {
            var model = editor.model;
            this.modal("hide");
            container.addFacet(model);
        }.bind(this.dialog));

        this.dialog.off("hidden").one("hidden", function(evt) {
            editor.destroy();
        });

    };

    return Container;
});
