define(["jquery",
        "display/facets/registry"],
    function ($, FacetRegistry) {
        "use strict";

        var config = {
        type:"tagcloud",
        expression:"",
        showMissing:true,
        sortDirection:"forward",
        sortMode:"value",
        selection:undefined,
        scroll:true,
        fixedOrder:undefined
    };

    var render = function(config) {
        config = config || this.config;
        var result = $("<div data-ex-role='facet' data-ex-facet-class='Cloud'  class='exhibit-facet exhibit-cloudFacet'></div>");
        result.attr("data-ex-expression", config.expression);
        if (config.name && config.name.length > 0) {
            result.attr("data-ex-facetLabel", config.name);
        }
        return result;
    };

    return FacetRegistry.register(config,render);

});
