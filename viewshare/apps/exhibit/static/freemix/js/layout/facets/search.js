define(["jquery", "display/facets/search", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.TextSearchFacet;
    Facet.prototype.icon_class = "fa fa-search fa-3x";

    Facet.prototype.label = "Search";
    Facet.prototype.template_name = "search-facet-editor";

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;
        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
            config.name = label.val();
            facet.triggerChange(config, template);
        });

    };

    return Facet;
});
