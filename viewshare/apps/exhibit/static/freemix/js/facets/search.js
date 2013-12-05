define(["jquery",
        "freemix/js/facets/registry"],
    function ($, FacetRegistry) {
        "use strict";

        var config = {
        type:"search",
        name:"Search"
    };
    var render = function (config) {
        config = config || this.config;
        var result = $("<div data-ex-role='facet' data-ex-facet-class='TextSearch' class='exhibit-facet'></div>");
        if (config.name && config.name.length > 0) {
            result.attr("data-ex-facet-label", config.name);
        }
        return result;

    };

    return FacetRegistry.register(config,render);

});
