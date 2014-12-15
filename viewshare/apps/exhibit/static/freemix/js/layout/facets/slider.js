define(["jquery", "handlebars", "display/facets/slider", "exhibit",
        "text!templates/layout/facets/slider-facet-editor.html"],
        function ($, Handlebars, Facet, Exhibit, template_html) {
        "use strict"

    Facet.prototype.exhibitClass = Exhibit.SliderFacet;
    Facet.prototype.propertyTypes = ["number", "currency"];

    Facet.prototype.icon_class = "fa fa-trello fa-3x";

    Facet.prototype.label = "Slider";
    Facet.prototype.template = Handlebars.compile(template_html);

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;
        var property = template.find("#facet_property");
        this._setupPropertySelect(config, template, property, "expression", this.propertyTypes, false, true);
        property.change();

        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
          config.name = label.val();
          facet.triggerChange(config, template);
        });
    };

    Facet.prototype.validate = function(config) {
        this.errors = [];
        if (!config.expression) {
            this.errors.push("This widget requires a property with a type of 'number'");
        }
        return this.errors.length == 0;
    };

    return Facet;
});
