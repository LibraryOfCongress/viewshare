define(["jquery",
        "handlebars",
        "display/views/registry",
        "display/lenses/registry",
        "layout/widget_editor",
        "text!templates/layout/view-container.html"],
    function($,
             Handlebars,
             ViewRegistry,
             LensRegistry,
             WidgetEditor,
             template) {
    "use strict";

    var Container = function(options) {
        this.id = options.id;
        this.element = options.element;
    };

    Container.prototype.template = Handlebars.compile(template);

    Container.prototype.render = function() {

        this.element.data("model", this);
        this.element.append(this.template({id: this.id}));

        var set = this.element.find(".view-set");
        set.sortable({
            group: 'views',
            tolerance: 0,
            distance: 10,
            vertical: false,
            nested: false
        });

        this.dialog = this.element.find(".build-view-modal");
        this.dialog.appendTo("body");

        this.dialog.modal({
            show:false
        });

        this.element.find("button.create-view-button").click(this.setupEditor.bind(this));
    };

    Container.prototype.getContent = function() {
        return this.element.find(".view-content");
    };

    Container.prototype.serialize = function() {
        var config = [];
        this.element.find("ul.view-set>li").each(function() {
            if (!$(this).hasClass("create-view")) {
                var view = $(this).data("model");
                config.push(view.serialize());
            }
        });
        return config;
    };

    Container.prototype.addView = function(view) {
        this.element.find('.view-set').append(view.findWidget());
    };

    Container.prototype.getSelected = function() {
        return this.element.find(".view-set>li.active");
    };

    Container.prototype.setupEditor = function() {
        var container = this;
        this.dialog.empty();
        var editor = new WidgetEditor({
            "title": "Add View",
            "registry": ViewRegistry,
            "element": container.dialog,
            "switchable": true
        });

        editor.render();

        this.dialog.off("edit-widget").one("edit-widget", function(evt) {
            var model = editor.model;
            this.modal("hide");
            container.addView(model);
        }.bind(this.dialog));

        this.dialog.off("hidden").one("hidden", function(evt) {
            editor.destroy();
        });

    };

    return Container;

});
