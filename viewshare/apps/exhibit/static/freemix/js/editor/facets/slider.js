define(["jquery", "freemix/js/facets/slider", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.SliderFacet;
    Facet.prototype.propertyTypes = ["number", "currency"];

    Facet.prototype.thumbnail = "/static/freemix/img/slider-facet.png";
    Facet.prototype.label = "Slider";
    Facet.prototype.template_name = "slider-facet-editor";

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;
        var select = template.find("#facet_property");
        var properties = this._generatePropertyList(facet.propertyTypes);

        $.each(properties, function() {
          var option = $("<option>").attr("value", this.expression).text(this.label);
          select.append(option);
        });
        if (config.expression) {
          select.val(config.expression);
        } else {
          select.get(0).options[0].selected=true;
          config.expression = select.val();
        }
        select.change(function() {
          config.expression = $(this).val();
          template.trigger("update-preview");
        });

        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
          config.name = label.val();
          template.trigger("update-preview");
        });
    };

    return Facet;
});
