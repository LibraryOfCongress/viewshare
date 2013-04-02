/*global jQuery */
(function($, Freemix) {

    Freemix.facet.addFacetType({
        facetClass: Exhibit.TextSearchFacet,
        thumbnail: "/static/exhibit/img/search-facet.png",
        label: "Search",
        config: {
            type: "search",
            name: "Search"
        },
        generateExhibitHTML: function (config) {
            config = config || this.config;
            var result = $("<div ex:role='facet' ex:facetClass='TextSearch' class='exhibit-facet'></div>");
            if (config.name && config.name.length > 0) {
                result.attr("ex:facetLabel", config.name);
            }
            return result;

        },
        template_name: "search-facet-editor",

        setupEditor: function(config, template) {
            var facet = this;

            var label = template.find("#facet_name");
            label.val(config.name);
            label.change(function() {
                config.name = label.val();
                template.trigger("update-preview");
            });

        }
    });

})(window.Freemix.jQuery, window.Freemix);
