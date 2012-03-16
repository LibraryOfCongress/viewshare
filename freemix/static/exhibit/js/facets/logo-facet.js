/*global jQuery */

 (function($, Freemix) {

     Freemix.facet.addFacetType({
         thumbnail: "/static/exhibit/img/logo-facet.png",
         label: "Logo",
         config: {
            type: "logo",
            src: undefined,
            alt: undefined,
            href: undefined,
            width: undefined,
            height: undefined
        },
        generateExhibitHTML: function(config) {
            config = config || this.config;
            var img = $("<img/>");
            if (config.src) {
                img.attr("src", config.src);
            }
            if (config.alt) {
                img.attr("alt", config.alt);
            }
            if (config.width) {
                img.attr("style", "max-width:" + config.width + "px");
            }
            if (config.href) {
                var link = $("<a/>");
                link.attr("href", config.href);
                link.attr("target", "_blank");
                link.append(img);
                var p = $("<span/>");
                p.append(link);
                return p.html();
            }
            var s = $("<span/>");
            s.append(img);
            p = $("<span/>");
            p.append(s);
            return p.html();
        },
        showEditor: function(facetContainer) {
            var facet = this;
            facetContainer = facetContainer || facet.findContainer();

            var config = $.extend(true, {}, facet.config);
            var template = Freemix.getTemplate("logo-facet-editor");
            var dialog = facetContainer.getDialog();

            template.data("model", this);


            function validate() {

                 var disabled_buttons = [{
                      text: "Ok",
                      id: "ok-button",
                      disabled: true,
                      click: function() {
                              return false;
                          }
                      },
                      {
                      text: "Cancel",
                      click: function() {
                              $(this).dialog("close");
                          }
                      }];

                 var enabled_buttons = [{
                       text: "Ok",
                       id: "ok-button",
                       click: function() {
                               var model = template.data("model");
                               model.config = config;
                               facetContainer.findWidget().trigger("edit-facet");
                               model.refresh();
                               facetContainer.getDialog().dialog("close");
                           }
                       },
                       {
                       text: "Cancel",
                       click: function() {
                               $(this).dialog("close");
                           }
                       }
                  ];

                if (config.src && config.src.length > 0) {

                    dialog.find("#ok-button,  #load-image-button").prop("disabled", false);
                    dialog.dialog("option", "buttons", enabled_buttons);

                } else {
                    dialog.find("#ok-button, #text-facet-slider, #load-image-button").prop("disabled", true);
                    dialog.dialog("option", "buttons", disabled_buttons);


                }
                updatePreview();
             }

            function updatePreview() {
                var preview = config.src ? facet.generateExhibitHTML(config) : "";
                template.find("#facet-preview").empty().append(preview);

            }

            function updateSlider() {
                var slider = $("#logo-facet-slider", template);

                if (config.src) {
                    var img = template.find("#facet-preview img");
                    img.load(function() {
                         var naturalWidth = img.get(0).naturalWidth;
                         if (!naturalWidth) {
                             naturalWidth = img.get(0).width * 2;
                         }

                         slider.slider('option', 'max', naturalWidth);
                         slider.slider('option', 'value', config.width || img.get(0).width);
                     });
                } else {

                }
            }

            facetContainer = facetContainer || this.findContainer();
            var src = template.find("#id_src");
            var alt = template.find("#id_alt");
            var href = template.find("#id_href");
            var size = template.find("#logo-facet-size");

            src.change(function(event) {
                config.src = $(event.target).val();
                validate();
                updateSlider();

            });

            src.val(config.src);

            alt.change(function(event) {
                config.alt = $(event.target).val();
                validate();
            });
            alt.val(config.alt);

            href.change(function(event) {
                config.href = $(event.target).val();
                validate();
            });
            href.val(config.href);

            var slider = $("#logo-facet-slider", template);


            size.val(config.width);
            size.change(function(event) {
                config.width = $(event.target).val();
                slider.slider("value", config.width);
                validate();
            });


            slider.slider({
                slide: function(event, ui) {
                    size.val(ui.value);
                    config.width=ui.value;
                    validate();
                    return true;
                }
            });
            dialog.empty().append(template).dialog("option", {
                title: "Edit Logo",
                position: "center"
            }).dialog("option", "position", "center");
            validate();
            updateSlider();

            dialog.dialog("open");
        },
        refresh: function() {
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
        },
        serialize: function() {
            return $.extend(true, {}, this.config);
        }
    });

})(window.Freemix.jQuery, window.Freemix);
