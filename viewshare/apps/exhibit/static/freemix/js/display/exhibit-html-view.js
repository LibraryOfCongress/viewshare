define(["jquery",
        "display/views/registry",
        "display/facets/registry",
        "text!freemix/js/templates/exhibit-wrapper.html"],
    function($, ViewRegistry, FacetRegistry,
             wrapper) {
    "use strict";

    function render_container(selector, registry, model, span) {
        if (model.length > 0) {
            $.each(model, function() {
                var facet = registry.construct(this.type, this);
                selector.append(facet.generateExhibitHTML());
            });
            selector.wrap("<div class='span" + span + "'>");
        } else {
            selector.remove();
        }
    }

    return function(model) {
        var result = $(wrapper);
        var top_facets = model.facets["top-facets"] || [];
        var right_facets = model.facets["right-facets"] || [];
        var left_facets = model.facets["left-facets"] || [];
        var views = model.views.views;

        var view_span, facet_span;
        if (left_facets.length ==0 && right_facets.length == 0) {
            view_span = 12;
        } else if (left_facets.length > 0 && right_facets.length > 0) {
            view_span = 8;
            facet_span = 2;
        } else {
            view_span = 9;
            facet_span = 3;
        }
        render_container(result.find("#top-facets"),
                         FacetRegistry,
                         top_facets,
                         12);

        render_container(result.find("#left-facets"),
                         FacetRegistry,
                         left_facets,
                         facet_span);

        render_container(result.find("#right-facets"),
                         FacetRegistry,
                         right_facets,
                         facet_span);

        render_container(result.find("#views"),
                         ViewRegistry,
                         views,
                         view_span);

        return result;

    };

});
