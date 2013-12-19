define(["jquery", "display/facets/tagcloud", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.CloudFacet;
    Facet.prototype.propertyTypes = ["date", "number", "text", "currency"];

    Facet.prototype.icon_class = "fa fa-tags fa-3x";

    Facet.prototype.label = "Tag Cloud";
    Facet.prototype.template_name = "tagcloud-facet-editor";
    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;
        var property = template.find("#facet_property");
        this._setupPropertySelect(config, template, property, "expression", this.propertyTypes);
        property.change();

        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
            config.name = label.val();
            facet.triggerChange(config, template);
        });

    };

    return Facet;
});
