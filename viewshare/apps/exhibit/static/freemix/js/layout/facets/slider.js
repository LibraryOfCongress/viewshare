define(["jquery", "display/facets/slider", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.SliderFacet;
    Facet.prototype.propertyTypes = ["number", "currency"];

    Facet.prototype.icon_class = "fa fa-trello fa-3x";

    Facet.prototype.label = "Slider";
    Facet.prototype.template_name = "slider-facet-editor";

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;
        var property = template.find("#facet_property");
        this._setupPropertySelect(config, template, property, "expression", this.propertyTypes);
        property.change();

        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
          config.name = label.val();
          template.trigger(facet.refreshEvent);
        });
    };

    return Facet;
});
