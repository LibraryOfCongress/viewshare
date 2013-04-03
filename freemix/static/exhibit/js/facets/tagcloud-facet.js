/*global jQuery */
 (function($, Freemix) {

    Freemix.facet.addFacetType({
        facetClass: Exhibit.CloudFacet,
        propertyTypes: ["date", "number", "text", "currency"],

        thumbnail: "/static/exhibit/img/cloud-facet.png",
        label: "Tag Cloud",
        config: {
            type: "tagcloud",
            expression: "",
            showMissing: true,
            sortDirection: "forward",
            sortMode: "value",
            selection: undefined,
            scroll: true,
            fixedOrder: undefined
        },
        generateExhibitHTML: function (config) {
            config = config || this.config;
            var result = $("<div ex:role='facet' ex:facetClass='Cloud'  class='exhibit-facet exhibit-cloudFacet'></div>");
            result.attr("ex:expression", config.expression);
            if (config.name && config.name.length > 0) {
                result.attr("ex:facetLabel", config.name);
            }
            return result;
        },

        template_name: "tagcloud-facet-editor",
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
