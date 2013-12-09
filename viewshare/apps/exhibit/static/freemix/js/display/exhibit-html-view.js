define(["jquery",
        "display/views/registry",
        "display/facets/registry",
        "text!freemix/js/templates/exhibit-wrapper.html"],
    function($, ViewRegistry, FacetRegistry,
             wrapper) {
    "use strict";

    function render_facets(root, model) {
        $.each(model, function() {
            var facet = FacetRegistry.construct(this.type, this);
            root.append(facet.generateExhibitHTML());
        });
    }

    return function(model) {
        var result = $(wrapper);
        var top_facets = model.facets["top-facets"] || [];
        var right_facets = model.facets["right-facets"] || [];
        var left_facets = model.facets["left-facets"] || [];
        var views = model.views.views;

        if (top_facets.length > 0) {
            var root = result.find("#top-facets");
            render_facets(root, top_facets);
        } else {
            result.find("#top-facets").parent().remove();
        }

        var view_span = 12;
        if (left_facets.length > 0) {
            view_span -=2;
            render_facets(result.find("#left-facets"), left_facets);
        } else {
            result.find("#left-facets").remove();
        }

        if (right_facets.length > 0) {
            view_span -=2;
            render_facets(result.find("#right-facets"), right_facets);
        } else {
            result.find("#right-facets").remove();
        }

        var container = result.find("#views")
        $.each(views, function() {
            var view = ViewRegistry.construct(this.type,this);
            container.append(view.generateExhibitHTML());
            container.addClass("span" + view_span);
        });

        return result;

    };

});
