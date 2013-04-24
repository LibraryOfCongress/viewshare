(function($, Freemix, Exhibit) {
    "use strict";

    var expression = Freemix.exhibit.expression;

    Freemix.facet.getFacetContainer = function(id) {
        return $(".facet-container#" + id, Freemix.getBuilder()).data("model");
    };

    Freemix.facet.BaseFacet.prototype.facetClass = Exhibit.ListFacet;
    Freemix.facet.BaseFacet.prototype.findContainer = function() {
        return this.findWidget().parents(".facet-container").data("model");
    };
    Freemix.facet.BaseFacet.prototype.generateWidget = function() {
        var facet = this;
        return $("<div class='facet ui-draggable'>" +
                 "<div class='facet-header ui-state-default ui-helper-clearfix ui-dialog-titlebar' title='Click and drag to move to any other facet sidebar or to reorder facets'>" +
                 "<i class='icon-move'></i>" +
                 "<span class='view-label'/>" +
                 "<i class='icon-remove delete-button pull-right'></i>" +
                 "</div>" +
                 "<div class='facet-body ui-widget-content'>" +
                 "<div class='facet-content'></div>" +
                 "<div class='facet-menu'><a href='#' title='Edit this facet'><i class='icon-edit'></i> Edit</a></div>" +
                 "</div></div>")
        .attr("id", this.config.id)
        .find("span.view-label").text(this.label).end()
        .data("model", this)
        .find(".delete-button").click(function() {
                facet.remove();
                return false;
            }).end()
        .find(".facet-menu a").click(function() {
                facet.showEditor();
                return false;
            }).end();

    };

    Freemix.facet.BaseFacet.prototype.refresh = function() {
        this.findWidget().find(".facet-content").empty().append(this.generateExhibitHTML());
        var exhibit = Freemix.getBuilderExhibit();
        this.facetClass.createFromDOM(this.findWidget().find(".facet-content div").get(0), null, exhibit.getUIContext());
    };

    Freemix.facet.BaseFacet.prototype.updatePreview = function(target, config) {
        var preview = $(this.generateExhibitHTML(config));
        target.empty().append(preview);
        var exhibit = Freemix.getBuilderExhibit();
        this.facetClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());
    };

    Freemix.facet.BaseFacet.prototype.showEditor = function(facetContainer){
        var facet = this;
        var config = $.extend(true, {}, facet.config);
        var template = Freemix.getTemplate("facet-editor");
        facetContainer = facetContainer || facet.findContainer();
        var dialog = facetContainer.getDialog();
        template.data("model", this);
        var form = Freemix.getTemplate(this.template_name);
        template.find(".facet-properties .facet-edit-body").append(form);

        form.submit(function() {return false;});

        template.bind("update-preview", function() {
            facet.updatePreview(template.find("#facet-preview"), config);
        });
        this.setupEditor(config, template);

        dialog.empty().append(template);
        dialog.find("#facet_save_button").click(function() {
           var model = template.data("model");
           model.config = config;
           facetContainer.findWidget().trigger("edit-facet");
           model.refresh();
           facetContainer.getDialog().modal("hide");
        });
        dialog.modal("show");
        template.trigger("update-preview");
    };

    function isFacetCandidate(prop) {
        return (prop.values > 1 && prop.values + prop.missing !== Freemix.exhibit.database.getAllItemsCount());
    }

    function simpleSort(a, b) {
        if (a.missing === b.missing) {
            return a.values - b.values;
        } else {
            return a.missing - b.missing;
        }
    }

    function sorter(a, b) {
        var aIsCandidate = isFacetCandidate(a);
        var bIsCandidate = isFacetCandidate(b);

        if ((aIsCandidate && bIsCandidate) || (!aIsCandidate && !bIsCandidate)) {
            return simpleSort(a, b);
        }
        return bIsCandidate ? 1: -1;
    }

    Freemix.facet.BaseFacet.prototype._generatePropertyList = function(types) {
        var properties = [];
        var database = Freemix.exhibit.database;
        var proplist = types? database.getPropertiesWithTypes(types) : database.getAllPropertyObjects();
        $.each(proplist, function(inx, prop) {
            properties.push(Freemix.exhibit.getExpressionCount(expression(prop.getID()), prop.getLabel()));
        });
        properties.sort(sorter);
        return properties;
    };


})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
