define(["jquery",
        "display/facets/registry"],
    function ($, FacetRegistry) {
        "use strict";


        var config = {
        name: "Range",
        type:"NumericRange",
        interval:10
    };

    var render = function (config) {
        config = config || this.config;
        var result = $("<div data-ex-role='facet' data-ex-facet-class='NumericRange'  class='exhibit-facet'></div>");
        result.attr("data-ex-expression", config.expression);
        if (config.name && config.name.length > 0) {
            result.attr("data-ex-facetLabel", config.name);
        }
        if (config.interval && config.interval > 0) {
            result.attr("data-ex-interval", config.interval);
        }

        return result;

    };

    return FacetRegistry.register(config,render);

});
