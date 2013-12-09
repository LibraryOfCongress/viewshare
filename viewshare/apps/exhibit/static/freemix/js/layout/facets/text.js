define(["jquery",
        "display/facets/text",
        "exhibit",
        "freemix/js/lib/creole"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.thumbnail = "/static/freemix/img/text-facet.png";
    Facet.prototype.icon_class = "fa fa-font fa-3x";

    Facet.prototype.label = "Text";
    Facet.prototype.template_name="text-facet-editor";

    Facet.prototype.refresh = function () {
        var facet = this;
        var result = $("<div class='text-facet-content'></div>");
        result.append(this.generateExhibitHTML());
        this.findWidget().find(".facet-content").empty().append(result);
        return result;
    };

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;
        $("textarea", template)
            .val(config.text || "")
            .keyup(function () {
                config.text = $(this).val();
                template.trigger("update-preview");
            });
    };

    Facet.prototype.updatePreview = function(target, config) {
        config = config || this.config;
        target.empty().creole(config.text);
    };

    return Facet;
});
