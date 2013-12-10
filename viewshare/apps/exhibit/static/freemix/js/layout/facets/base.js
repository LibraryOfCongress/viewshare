define(["jquery",
        "exhibit",
        "display/facets/base",
        "freemix/js/freemix",
        "text!templates/layout/facet-widget.html",
        "freemix/js/exhibit_utilities"],
    function($, Exhibit, BaseFacet, Freemix, facet_widget_template) {
    "use strict";

    var expression = function(property){return "." + property;};

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
                        facet.showEditor();
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
        var form = Freemix.getTemplate(this.template_name);
        template.find(".widget-edit-settings-body").empty().append(form);

        form.submit(function() {return false;});

        this.setupEditor(config, template);

        template.find("#widget_save_button").off("click").click(function() {
           model.config = config;
           template.trigger("edit-widget");
        });
        template.bind("update-preview", function() {
            model.updatePreview(template.find(".widget-preview-body"), config);
        });
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

    var expressionCache = {};

    function getExpressionCount(expression, name) {
            var label = name || expression;

            var expressionCount = expressionCache[expression];
            if (!expressionCount) {
                var database = Freemix.exhibit.database;
                var items = database.getAllItems();

                var facet_cache = new Exhibit.FacetUtilities.Cache(database,
                Exhibit.Collection.createAllItemsCollection("default", database),
                Exhibit.ExpressionParser.parse(expression));

                var counts = facet_cache.getValueCountsFromItems(items);
                var missing = facet_cache.countItemsMissingValue(items);
                expressionCount = {
                    expression: expression,
                    values: counts.entries.length,
                    missing: missing
                };
                expressionCache[expression] = expressionCount;
            }
            return $.extend({}, expressionCount, {label: label});
        }

    BaseFacet.prototype._generatePropertyList = function(types) {
        var properties = [];
        var database = Freemix.exhibit.database;
        var proplist = types? database.getPropertiesWithTypes(types) : database.getAllPropertyObjects();
        $.each(proplist, function(inx, prop) {
            properties.push(getExpressionCount(expression(prop.getID()), prop.getLabel()));
        });
        properties.sort(sorter);
        return properties;
    };

    return BaseFacet;

});
