define(["jquery", "handlebars", "display/facets/list",
        "text!templates/layout/facets/list-facet-editor.html"],
        function ($, Handlebars, Facet, template_html) {

    Facet.prototype.label = "List";
    Facet.prototype.propertyTypes = ["date", "number", "text", "currency"];
    Facet.prototype.icon_class = "fa fa-list-alt fa-3x";

    Facet.prototype.template = Handlebars.compile(template_html);

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
    }

    return Facet;
});
