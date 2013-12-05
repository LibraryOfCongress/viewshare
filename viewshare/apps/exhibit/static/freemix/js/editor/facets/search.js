define(["jquery", "freemix/js/facets/search", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.TextSearchFacet;
    Facet.prototype.thumbnail = "/static/exhibit/img/search-facet.png";
    Facet.prototype.label = "Search";
    Facet.prototype.template_name = "search-facet-editor";

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;

        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
            config.name = label.val();
            template.trigger("update-preview");
        });

    };

    return Facet;
});
