define(["jquery",
        "exhibit",
        "display/facets/base",
        "freemix/js/freemix",
        "display/facets/registry",
        "layout/widget_editor",
        "text!templates/layout/facet-widget.html",
        "freemix/js/exhibit_utilities"],
    function($, Exhibit, BaseFacet, Freemix, FacetRegistry, WidgetEditor, facet_widget_template) {
    "use strict";

    var expression = function(property){return "." + property;};

    BaseFacet.prototype.refreshEvent = "refresh-preview.facet";


    BaseFacet.prototype.facetClass = Exhibit.ListFacet;

    BaseFacet.prototype.findContainer = function() {
        return this.findWidget().parents(".facet-container").data("model");
    };
    BaseFacet.prototype.generateWidget = function() {
        var facet = this;
        return $(facet_widget_template)
                .attr("id", this.config.id)
                .find("span.view-label").text(this.label).end()
                .data("model", this)
                .find(".delete-button").click(function() {
                        facet.remove();
                        return false;
                    }).end()
                .find(".facet-menu a").click(function() {
                        var editor = new WidgetEditor({
                            "title": "Add Widget",
                            "registry": FacetRegistry,
                            "element": facet.findContainer().getDialog(),
                            "switchable": false,
                            "model": facet
                        });

                        editor.render();
                        facet.findContainer().getDialog().modal("show");
                        facet.findContainer().getDialog().one("edit-widget", function() {
                            facet.findContainer().getDialog().modal("hide");
                            facet.refresh();
                        });
                        return false;
                    }).end();

    };

    BaseFacet.prototype.refresh = function() {
        this.findWidget().find(".facet-content").empty().append(this.generateExhibitHTML());
        var exhibit = Freemix.getBuilderExhibit();
        this.facetClass.createFromDOM(this.findWidget().find(".facet-content div").get(0), null, exhibit.getUIContext());
    };

    BaseFacet.prototype.updatePreview = function(target, config) {
        config = config || this.config;
        var preview = $(this.generateExhibitHTML(config));
        target.empty().append(preview);
        var exhibit = Freemix.getBuilderExhibit();
        this.facetClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());
    };

    BaseFacet.prototype.showEditor = function(template){
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
        });
        template.bind(this.refreshEvent, function() {
            model.updatePreview(template.find(".widget-preview-body"), config);
        });
        this.triggerChange(config, template);
    };

    BaseFacet.prototype._propertyRenderer = function(prop) {
        return "." + prop.getID();
    }

    return BaseFacet;

});
