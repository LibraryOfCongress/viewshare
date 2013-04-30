(function ($, Freemix, Exhibit) {
    "use strict";

    var Facet = Freemix.facet.prototypes.list;

    Facet.prototype.thumbnail = "/static/exhibit/img/list-facet.png";
    Facet.prototype.label = "List";
    Facet.prototype.propertyTypes = ["date", "number", "text", "currency"];

    Facet.prototype.template_name="list-facet-editor";

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
    }
})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
