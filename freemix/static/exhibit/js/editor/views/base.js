(function($, Freemix, Exhibit) {
    "use strict";

    Freemix.view.getViewContainer = function(id) {
        return $(".view-container#" + id, Freemix.getBuilder()).data("model");
     };

    var BaseView = Freemix.view.BaseView;
    
    BaseView.prototype.refreshEvent = "refresh-preview.view";

    BaseView.prototype.propertyTypes = ["text", "image", "currency", "url", "location", "date", "number"];

    BaseView.prototype.viewClass = Exhibit.TileView;

    BaseView.prototype.showEditor = function(vc) {
        vc._dialog.dialog("close");
        vc.addView(this);
        this.select();
    };

    BaseView.prototype.getContainer = function() {
        if (!this._container) {
            this._container = this.findWidget().parents(".view-container");
        }
        return this._container;
    };

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
        $(".view-set>li.view", this.getContainer()).removeClass("active")
        .find(".popup-button").hide();

        control.addClass("active");
        control.find('.popup-button').show();

        content.off(view.refreshEvent);
        view.display();
        content.on(view.refreshEvent, function() {
            view.refreshPreview();
        });
        content.trigger(view.refreshEvent);
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

    BaseView.prototype.refreshPreview = function() {
        var well = this.getContent().find(".view-preview .view-preview-pane");
        well.empty().append(this.generateExhibitHTML());
        var exhibit = Freemix.getBuilderExhibit();
        this.viewClass.createFromDOM(well.find("div").get(0), null, exhibit.getUIContext());
    };

    BaseView.prototype.display = function() {};

    BaseView.prototype._setupViewForm = function(config) {
        config = config || this.config;
        var content = this.getContent();

        content.find("form").submit(function() {return false;});

    };

    BaseView.prototype._setupLabelEditor = function(config) {
        config = config||this.config;
        var view = this;
        var label = this.getContent().find("#view_label_input");

        label.val(config.name);
        label.change(function() {
            view.rename($(this).val());
            view.getContent().trigger(view.refreshEvent);
        });
    };



    BaseView.prototype._setupMultiPropertySortEditor = function() {
        var content = this.getContent();
        var sort = content.find("#sort_property");
        var order = content.find("#sort_order");
        var props = Freemix.exhibit.database.getAllPropertyObjects();
        this._populatePropertySelect(sort, props, true);
        this._setupSelectMultiPropertyHandler(sort, "orders");
        this._setupSelectMultiPropertyHandler(order, "directions");
    };

    BaseView.prototype._setupSelectMultiPropertyHandler = function(selector, key) {
        var config = this.config;
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
            view.getContent().trigger(view.refreshEvent);
        });

        if (config[key] && config[key].length > 0) {
            selector.val(config[key][0]);
        } else {
            selector.val('');
        }
    };

    BaseView.prototype._setupLensEditor = function(selector) {
        selector = selector || $("#lens_editor");
        var view = this;
        var lens = Freemix.lens.getLens(this.config.lens);
        lens.initializeEditor(selector);
        lens.getContent().off(lens.refreshEvent).on(lens.refreshEvent, function() {
            view.getContent().trigger(view.refreshEvent);
        });
    };

    BaseView.prototype._setupLensPicker = function(selector) {
        var inx, lens;
        var option = "<option value=''>Default</option>";
        var view = this;

        selector = selector || $("#select-view-lens");
        selector.empty().append(option);

        for (inx = 0 ; inx < Freemix.lens._array.length ; inx++) {
            lens = Freemix.lens._array[inx];
            option = $("<option></option>");
            option.attr("value", lens.config.id);
            option.text(lens.config.name);
            selector.append(option);
        }

        selector.change(function() {
            var value = $(this).val();
            if (value && value !== ( "" || undefined)) {
                view.config.lens = value;
            } else if (view.config.lens) {
                delete view.config.lens;
            }
            view.getContent().trigger(view.refreshEvent);
        });

        if (view.config.lens) {
            selector.val(view.config.lens);
        } else {
            selector.val('');
        }

    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);