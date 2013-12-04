define(["jquery", "exhibit/js/facets/logo", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.thumbnail = "/static/exhibit/img/logo-facet.png";
    Facet.prototype.label = "Logo";
    Facet.prototype.template_name = "logo-facet-editor";

    Facet.prototype.setupEditor = function(config, template) {

        function validate() {
            if (config.src && config.src.length > 0) {
                template.find("#facet_save_button").removeAttr("disabled").removeClass("disabled");
                template.find(".help-inline").addClass("hidden").parent(".control-group").removeClass("warning");

            } else {
                template.find("#facet_save_button").attr("disabled", "disabled").addClass("disabled");
                template.find(".help-inline").removeClass("hidden").parent(".control-group").addClass("warning");
            }
            template.trigger("update-preview");
        }

        function updateSlider() {
            var slider = $("#logo-facet-slider", template);

            if (config.src) {
                var img = template.find("#facet-preview img");
                img.load(function () {
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

        src.change(function (event) {
            config.src = $(event.target).val();
            validate();
            updateSlider();
        });

        src.val(config.src);

        alt.change(function (event) {
            config.alt = $(event.target).val();
            validate();
        });
        alt.val(config.alt);

        href.change(function (event) {
            config.href = $(event.target).val();
            validate();
        });
        href.val(config.href);

        var slider = $("#logo-facet-slider", template);


        size.val(config.width);
        size.change(function (event) {
            config.width = $(event.target).val();
            slider.slider("value", config.width);
            validate();
        });


        slider
            .slider({
            slide:function (event, ui) {
                size.val(ui.value);
                config.width = ui.value;
                validate();
                return true;
            }});

        validate();
        updateSlider();

    };

    Facet.prototype.updatePreview = function(target, config) {
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

