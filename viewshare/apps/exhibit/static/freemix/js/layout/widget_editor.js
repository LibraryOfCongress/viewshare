define(["jquery",
        "handlebars",
        "text!templates/layout/widget-editor.html",

        "bootstrap",
        "jquery.uuid"],
function($,
         Handlebars,
         widget_editor_template) {
    "use strict";

    function WidgetEditor(options) {
        this.title = options.title;
        this.registry = options.registry;
        this.element = options.element;
        this.switchable = true;

        this.widgets = $.map(options.registry.type_order, function(type) {
            var proto = options.registry.prototypes[type].prototype;
            return {
                "key": type,
                "icon_class": proto.icon_class,
                "label": proto.label
            };
        });

        if (options.model) {
            this.model = options.model;
            this.switchable = false;
        } else {

            var key = this.widgets[0].key;

            this.model = new this.registry.prototypes[key]();
            if (!this.model.config.id) {
                this.model.config.id = $.make_uuid();
            }
        }
    }

    WidgetEditor.prototype.template = Handlebars.compile(widget_editor_template);


    WidgetEditor.prototype.render = function() {
        var el = this.element;
        var context = {
            title: this.title,
            widgets: this.widgets
        };
        el.empty().append(this.template(context));
        var nav = el.find("ul.nav");
        var selected = nav.find("#" + this.model.config.type)
        selected.addClass("active");
        if (this.switchable) {
            nav.find("li a").on("click", function(evt) {
                evt.preventDefault();
                this.selectWidgetType($(evt.target).closest("li").attr("id"));
            }.bind(this));
        } else {
            nav.find("li").not(selected).addClass("disabled");
        }

        this.setModel(this.model);
    }

    WidgetEditor.prototype.setModel = function(model) {
        this.model = model;
        this.element.find("ul.nav li").removeClass("active");
        this.element.find("ul.nav #" + model.config.type).addClass("active");
        model.showEditor(this.element);
    }

    WidgetEditor.prototype.selectWidgetType = function(type) {
        var model = this.registry.construct(type);
        if (!model.config.id) {
            model.config.id = $.make_uuid();
        }
        this.setModel(model);

    }

    WidgetEditor.prototype.destroy = function() {

        this.element.find("ul.nav a").off("click");
        this.model.resetPreview(this.element.find(".widget-preview-body"));
        this.element.empty();
    }

    return WidgetEditor;
});
