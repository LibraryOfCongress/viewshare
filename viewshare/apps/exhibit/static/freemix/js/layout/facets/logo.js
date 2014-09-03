define(["jquery", "handlebars", "display/facets/logo", "exhibit", "text!templates/layout/facets/logo-facet-editor.html"],
        function ($, Handlebars, Facet, Exhibit, template_html) {
        "use strict"

    Facet.prototype.label = "Logo";
    Facet.prototype.template = Handlebars.compile(template_html);
    Facet.prototype.icon_class = "fa fa-picture-o fa-3x";

    Facet.prototype.validate = function(config) {
        this.errors = [];
        if (!config.src || config.src.length == 0) {
            this.errors.push("A source URL is required");
        }
        return this.errors == 0;
    };

    Facet.prototype.setupEditor = function(config, template) {

        function updateSlider() {
            var slider = $("#logo-facet-slider", template);

            if (config.src) {
                var img = template.find("#facet-preview img");
                img.on("load", function () {
                    var naturalWidth = img.get(0).naturalWidth;
                    if (!naturalWidth) {
                        naturalWidth = img.get(0).width * 2;
                    }

                    slider.slider('option', 'max', naturalWidth);
                    slider.slider('option', 'value', config.width || img.get(0).width);

                });
            }
        }


        var src = template.find("#id_src");
        var alt = template.find("#id_alt");
        var href = template.find("#id_href");
        var size = template.find("#logo-facet-size");
        var facet = this;
        src.change(function (event) {
            config.src = $(event.target).val();
            facet.triggerChange(config, template);
            updateSlider();
        });

        src.val(config.src);

        alt.change(function (event) {
            config.alt = $(event.target).val();
            facet.triggerChange(config, template);
        });
        alt.val(config.alt);

        href.change(function (event) {
            config.href = $(event.target).val();
            facet.triggerChange(config, template);
        });
        href.val(config.href);

        var slider = $("#logo-facet-slider", template);


        size.val(config.width);
        size.change(function (event) {
            config.width = $(event.target).val();
            slider.slider("value", config.width);
            facet.triggerChange(config, template);
        });


        slider
            .slider({
            slide:function (event, ui) {
                size.val(ui.value);
                config.width = ui.value;
            facet.triggerChange(config, template);
                return true;
            }});

        facet.triggerChange(config, template);
        updateSlider();

    };

    Facet.prototype.renderPreview = function(target, config) {
        var preview = config.src ? this.generateExhibitHTML(config) : "";
        target.empty().append(preview);
    };

    Facet.prototype.refresh = function() {
        var config = this.config;
        var html = $(this.generateExhibitHTML());
        var img = html.find("img");

        var div = $("<div/>");
        var block = $("<div/>");
        block.append(img);
        div.append(block);
        if (config.href) {
            div.append($("<div>Link: <em>" + config.href + "</em></div>"));
        }
        this.findWidget().find(".facet-content").empty().append(div);

        return div;
    };

    return Facet;
});

