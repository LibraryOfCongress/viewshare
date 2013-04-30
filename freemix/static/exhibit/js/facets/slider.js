(function ($, Freemix) {
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

        var result = $("<div ex:role='facet' ex:facetClass='Slider' class='exhibit-facet'></div>");

        result.attr("ex:expression", config.expression);
        result.attr("ex:height", config.height);
        result.attr("ex:histogram", config.histogram);
        result.attr("ex:horizontal", config.horizontal);
        if (config.name && config.name.length > 0) {
            result.attr("ex:facetLabel", config.name);
        }
        return result;
    };

    Freemix.facet.register(config,render);

})(window.Freemix.jQuery, window.Freemix);
