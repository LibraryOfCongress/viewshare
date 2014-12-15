define(["jquery", "handlebars", "display/facets/search", "exhibit",
        "text!templates/layout/facets/search-facet-editor.html"],
        function ($, Handlebars, Facet, Exhibit, template_html) {
        "use strict"

    Facet.prototype.exhibitClass = Exhibit.TextSearchFacet;
    Facet.prototype.icon_class = "fa fa-search fa-3x";

    Facet.prototype.label = "Search";
    Facet.prototype.template = Handlebars.compile(template_html);

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
