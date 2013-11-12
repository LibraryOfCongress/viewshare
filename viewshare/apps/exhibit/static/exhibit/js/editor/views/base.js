(function($, Freemix, Exhibit) {
    "use strict";

    Freemix.view.getViewContainer = function(id) {
        return $(".view-container#" + id, Freemix.getBuilder()).data("model");
     };

    var BaseView = Freemix.view.BaseView;
    
    BaseView.prototype.refreshEvent = "refresh-preview.view";

    BaseView.prototype.propertyTypes = ["text", "image", "currency", "url", "location", "date", "number"];

    BaseView.prototype.viewClass = Exhibit.TileView;

    BaseView.prototype.showEditor = function(viewContainer) {
        var view = this;
        var config = $.extend(true, {}, view.config);
        var template = Freemix.getTemplate("view-editor");
        viewContainer = viewContainer || view.findContainer();
        var dialog = viewContainer.getDialog();
        template.data("model", this);
        var form = Freemix.getTemplate(this.template_name);
        template.find(".view-properties .view-edit-body").append(form);

        form.submit(function() {return false;});


        this.setupEditor(config, template);

        dialog.empty().append(template);
        dialog.find("#view_save_button").click(function() {
           var model = template.data("model");
           model.config = config;
           viewContainer.findWidget().trigger("edit-view");
           viewContainer.getDialog().modal("hide");
           model.select();
           
        });
        dialog.modal("show");

        template.bind(this.refreshEvent, function() {
            view.updatePreview(template.find("#view-preview"), config);
        });

        template.trigger(this.refreshEvent);
        
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
         return $("<li class='view'>" +
                  "<a href='#'>" + 
                  "<i class='icon-move'></i>" +
                  "<span class='view-label'></span>" +
                  "<i class='icon-remove delete-button'></i>" +
                  "</a>" + 
                  "</li>")

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

        $(".view-set>li.view", this.getContainer()).removeClass("active");
        control.addClass("active");
        this.updatePreview(content, this.config);
        content.prepend("<div class='view-menu'><div class='row-fluid'><div class='span12'><div class='pull-right'><a href='#' class='btn btn-small' title='Edit this view'><i class='icon-edit'></i> Edit</a></div></div></div></div>");
        content.find(".view-menu a").click(function() {
            view.showEditor();
            return false;
        });
    };

    BaseView.prototype.remove = function() {
        var container = this.getContainer();
        if (container.find(".view-set>li.view").size() > 1) {
            this.findWidget().remove();
            var next = container.find(".view-set>li.view:first");
            if (next.size() > 0) {
                next.data("model").select();
            } else {
                container.find(".view-content").empty();
            }
        }
    };

    BaseView.prototype.updatePreview = function(target, config) {
        config = config || this.config;
        var preview = $(this.generateExhibitHTML(config));
        target.empty().append(preview);
        var exhibit = Freemix.getBuilderExhibit();
        this.viewClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());
    };

    BaseView.prototype.display = function() {};

    BaseView.prototype.setupEditor = function() {};

    BaseView.prototype._setupViewForm = function(config, template) {
        template.find("form").submit(function() {return false;});

    };

    BaseView.prototype._setupLabelEditor = function(config, template) {
        var view = this;
        var label = template.find("#view_label_input");

        label.val(config.name);
        label.change(function() {
            view.rename($(this).val());
            template.trigger(view.refreshEvent);
        });
    };



    BaseView.prototype._setupMultiPropertySortEditor = function(config, template) {
        var sort = template.find("#sort_property");
        var order = template.find("#sort_order");
        var props = Freemix.exhibit.database.getAllPropertyObjects();
        this._populatePropertySelect(sort, props, true);
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
            template.trigger(view.refreshEvent);
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
            lens = Freemix.lens.copyDefaultLens();
            Freemix.lens.setDefaultLens(lens);
            config.lens = lens.config;
        } else {
            lens = Freemix.lens.construct(config.lens);
        }

        lens.initializeEditor(selector);
        selector.off(lens.refreshEvent).on(lens.refreshEvent, function() {
            config.lens = lens.config;
            template.trigger(view.refreshEvent);
        });
    };


})(window.Freemix.jQuery, window.Freemix, window.Exhibit);