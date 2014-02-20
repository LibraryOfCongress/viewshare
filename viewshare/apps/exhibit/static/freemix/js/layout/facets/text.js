define(["jquery",
        "handlebars",
        "display/facets/text",
        "exhibit",
        "text!templates/layout/facets/text-facet-editor.html",
        "creole"],
        function ($, Handlebars, Facet, Exhibit, template_html) {
        "use strict"

    Facet.prototype.icon_class = "fa fa-font fa-3x";

    Facet.prototype.label = "Text";
    Facet.prototype.template = Handlebars.compile(template_html);

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
                facet.triggerChange(config, template);
            });
    };

    Facet.prototype.updatePreview = function(target, config) {
        config = config || this.config;
        target.empty().creole(config.text);
    };

    return Facet;
});
