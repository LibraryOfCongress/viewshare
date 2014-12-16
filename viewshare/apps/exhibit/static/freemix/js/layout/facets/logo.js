define(["jquery",
        "handlebars",
        "display/facets/logo",
        "exhibit",
        "text!templates/layout/facets/logo-facet-editor.html",
        "lib/jquery.nouislider"],
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

    Facet.prototype.previewEvent = "preview-rendered.freemix";

    Facet.prototype.setupEditor = function(config, template) {

        function updateSlider() {
            var slider = $("#logo-facet-slider", template);
            var size = template.find("#logo-facet-size");
            if (config.src) {
                var img = template.find(".widget-edit-preview img");
                img.one("load", function () {
                    var naturalWidth = img.get(0).naturalWidth;
                    if (!naturalWidth) {
                        naturalWidth = img.get(0).width * 2;
                    }

                    if (!isNaN(naturalWidth)) {
                        slider.noUiSlider({
                            handles: 1,
                            range: [0, naturalWidth],
                            start: [config.width || naturalWidth],
                            step: 1
                        }, true);
                        size.val(config.width || naturalWidth);
                        slider.attr("disabled", false);
                        size.attr("disabled", false);
                    } else {
                        slider.attr("disabled", true);
                        size.val("");
                        size.attr("disabled", true);
                    }

                }).each(function() {
                    if (this.complete) $(this).load();
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
            slider.val(config.width);
            facet.triggerChange(config, template);
        });


        slider.change(function (event) {
            size.val(Math.floor(slider.val()));
            config.width = Math.floor(slider.val());
            facet.triggerChange(config, template);
            return true;
        });
        facet.triggerChange(config, template);

        template.find(".widget-preview-body").one(this.previewEvent, updateSlider);
        updateSlider();

    };

    Facet.prototype.renderPreview = function(target, config) {
        var preview = config.src ? this.generateExhibitHTML(config) : "";
        target.empty().append(preview);
        target.trigger(this.previewEvent);
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

