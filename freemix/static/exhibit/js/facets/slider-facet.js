/*global jQuery */
 (function($, Freemix) {

    Freemix.facet.addFacetType({
        facetClass: Exhibit.SliderFacet,
        propertyTypes: ["number", "currency"],

        thumbnail: "/static/exhibit/img/slider-facet.png",
        label: "Slider",
        config: {
            type: "Slider",
            expression: "",
            height: "50px",
            histogram: true,
            horizontal: true
        },
        generateExhibitHTML: function(config) {
            config = config || this.config;

            var result = $("<div ex:role='facet' ex:facetClass='Slider' class='exhibit-facet'></div>");

            result.attr("ex:expression", config.expression);
            result.attr("ex:height", config.height);
            result.attr("ex:histogram", config.histogram);
            result.attr("ex:horizontal", config.horizontal);
            if (config.name && config.name.length > 0) {
                result.attr("ex:facetLabel", config.name);
            }
            return result;
//
//            return "<div ex:role='facet' ex:facetClass='Slider' ex:histogram='true' ex:horizontal='true' ex:height='50px' ex:expression='" + config.expression +
//                "' ex:facetLabel='" + config.name + "'></div>";
        },
        showEditor: function(facetContainer) {
              var facet = this;
              var config = $.extend(true, {}, facet.config);
              var template = Freemix.getTemplate("slider-facet-editor");
              facetContainer = facetContainer || facet.findContainer();
              var dialog = facetContainer.getDialog();
              template.data("model", this);
              template.find("form").submit(function() {return false;});

              function updatePreview() {
                  var preview = $(facet.generateExhibitHTML(config));
                  template.find("#facet-preview").empty().append(preview);
                  var exhibit = Freemix.getBuilderExhibit();
                  facet.facetClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());

              }
              var select = template.find("#facet_property");
              var properties = Freemix.facet.generatePropertyList(facet.propertyTypes);

              $.each(properties, function() {
                  var option = "<option value='" + this.expression + "'>" + this.label + "</option>";
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
                  updatePreview();
              });

              var label = template.find("#facet_name");
              label.val(config.name);
              label.change(function() {
                  config.name = label.val();
                  updatePreview();
              });
              dialog.empty().append(template).dialog("option", {
                  title: "Edit Numeric Slider",
                  position: "center",
                  buttons: [{
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
                ]
              }).dialog("option", "position", "center");
              dialog.dialog("open");

              updatePreview();
          }
    });
})(window.Freemix.jQuery, window.Freemix);
