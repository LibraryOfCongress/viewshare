define(["jquery",
        "display/facets/registry"],
    function ($, FacetRegistry) {
        "use strict";


    var config = {
        type:"Slider",
        name: "Slider",
        expression:"",
        height:"50px",
        histogram:true,
        horizontal:true
    };

    var render = function (config) {
        config = config || this.config;

        var result = $("<div data-ex-role='facet' data-ex-facet-class='Slider' class='exhibit-facet'></div>");

        result.attr("data-ex-expression", config.expression);
        result.attr("data-ex-height", config.height);
        result.attr("data-ex-histogram", config.histogram);
        result.attr("data-ex-horizontal", config.horizontal);
        if (config.name && config.name.length > 0) {
            result.attr("data-ex-facet-abel", config.name);
        }
        return result;
    };

    return FacetRegistry.register(config,render);

});
