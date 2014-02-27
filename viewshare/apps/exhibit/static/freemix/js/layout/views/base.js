define(["jquery",
        "exhibit",
        "display/views/base",
        "display/lenses/registry",
        "display/views/registry",
        "layout/widget_editor",
        "freemix/js/freemix",
        "text!templates/layout/view-widget.html",
        "text!templates/layout/view-menu.html"
], function($, Exhibit, BaseView, LensRegistry, ViewRegistry, WidgetEditor, Freemix, widget_template, menu_template) {
    "use strict"

    BaseView.prototype.refreshEvent = "refresh-preview.view";

    BaseView.prototype.propertyTypes = ["text", "image", "currency", "url", "location", "date", "number"];

    BaseView.prototype.viewClass = Exhibit.TileView;

    BaseView.prototype.showEditor = function(template) {
        var model = this;
        var config = $.extend(true, {}, model.config);

        var form = $(this.template());
        template.find(".widget-edit-settings-body").empty().append(form);
        template.off(this.refreshEvent);

        form.submit(function() {return false;});


        this.setupEditor(config, template);

        template.find("#widget_save_button").off("click").click(function() {
           model.config = config;
           template.trigger("edit-widget");

           model.findWidget().find("span.view-label").text(model.config.name);
           model.select();
           
        });

        template.bind(this.refreshEvent, function() {
            model.updatePreview(template.find(".widget-preview-body"), config);
        });

        this.triggerChange(config, template);
        
    };

    BaseView.prototype.getContainer = function() {
        if (!this._container) {
            this._container = this.findWidget().parents(".view-container");
        }
        return this._container;
    };

    BaseView.prototype.findContainer = function() {
        return this.getContainer().data("model");
    }

    BaseView.prototype.getContent = function() {
        return this.getContainer().data("model").getContent();
    };

    BaseView.prototype.generateWidget = function() {
         var view = this;
         return $(widget_template)
            .attr("id", view.config.id)
            .find("span.view-label").text(view.config.name).end()
            .data("model", view)
            .click(function() {
                if (!$(this).hasClass("active")) {
                    $(this).data("model").select();
                }
                return false;
            })

            .find(".delete-button").click(function() {
                 view.remove();
                 return false;
             }).end();

    };

    BaseView.prototype.select = function() {
        var control = this.findWidget();
        var view = this;
        var content = this.getContent();
        content.empty();

        $(".view-set>li.view", this.getContainer()).removeClass("active");
        control.addClass("active");
        this.updatePreview(content, this.config);
        content.prepend(menu_template);
        content.find(".view-menu a").off("click").click(function() {
            var editor = new WidgetEditor({
                "title": "Add View",
                "registry": ViewRegistry,
                "element": view.findContainer().getDialog(),
                "switchable": false,
                "model": view
            });

            view.findContainer().getDialog().empty().one("shown", function() {
                editor.render();
            });
            view.findContainer().getDialog().modal("show");
            view.findContainer().getDialog().one("edit-widget", function() {
                view.findContainer().getDialog().modal("hide");
                view.select();
            });
            return false;
        });

    };

    BaseView.prototype.remove = function() {
        var container = this.getContainer();
        if (container.find(".view-set>li.view").length > 1) {
            this.findWidget().remove();
            var next = container.find(".view-set>li.view:first");
            if (next.length > 0) {
                next.data("model").select();
            } else {
                container.find(".view-content").empty();
            }
        }
    };

    BaseView.prototype.updatePreview = function(target, config) {
        config = config || this.config;
        this.resetPreview(target);
        var preview = this.generateExhibitHTML(config);
        target.append(preview);
        var exhibit = Freemix.getBuilderExhibit();

        try {
            target.data("preview", this.viewClass.createFromDOM(preview.get(0), null, exhibit.getUIContext()));
        } catch(ex) {
            target.empty();
            console.log(ex);
        }
    };

    BaseView.prototype.resetPreview = function(target) {
        var preview = target.data("preview");
        if (preview) {
            preview.dispose();
            target.data("preview", null);
        }
        target.empty();
    };

    BaseView.prototype.display = function() {};

    BaseView.prototype.setupEditor = function(config, template) {};

    BaseView.prototype._setupViewForm = function(config, template) {
        template.find("form").submit(function() {return false;});

    };

    BaseView.prototype._setupLabelEditor = function(config, template) {
        var view = this;
        var label = template.find("#view_label_input");

        label.val(config.name);
        label.change(function() {
            config.name = $(this).val();
            view.triggerChange(config, template);
        });
    };



    BaseView.prototype._setupMultiPropertySortEditor = function(config, template) {
        var sort = template.find("#sort_property");
        var order = template.find("#sort_order");
        this._populatePropertySelect(sort, [], true);
        this._setupSelectMultiPropertyHandler(config, template, sort, "orders");
        this._setupSelectMultiPropertyHandler(config, template, order, "directions");
    };

    BaseView.prototype._setupSelectMultiPropertyHandler = function(config, template, selector, key) {
        var view = this;
        selector.change(function() {
            var value = $(this).val();
            if ($.isArray(value)) {
                config[key] = value;
            } else if (value && value !== ( "" || undefined)) {
                config[key] = [value];
            } else {
                config[key] = [];
            }
            view.triggerChange(config, template);
        });

        if (config[key] && config[key].length > 0) {
            selector.val(config[key][0]);
        } else {
            selector.val('');
        }
    };

    BaseView.prototype._setupLensEditor = function(config, template) {
        var selector = $("#lens_editor", template);
        var view = this;
        var lens;
        if (!config.lens) {
            lens = LensRegistry.copyDefaultLens();
            LensRegistry.setDefaultLens(lens);
            config.lens = lens.config;
        } else {
            lens = LensRegistry.construct(config.lens);
        }

        lens.initializeEditor(selector);
        selector.off(lens.refreshEvent).on(lens.refreshEvent, function() {
            config.lens = lens.config;
            view.triggerChange(config, template);
        });
    };

    return BaseView;

});
