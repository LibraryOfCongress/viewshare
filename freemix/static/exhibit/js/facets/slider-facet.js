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
        template_name: "slider-facet-editor",

        setupEditor: function(config, template) {
            var facet = this;
              var select = template.find("#facet_property");
              var properties = Freemix.facet.generatePropertyList(facet.propertyTypes);

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
    });
})(window.Freemix.jQuery, window.Freemix);
