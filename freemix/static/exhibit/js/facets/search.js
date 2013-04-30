(function ($, Freemix) {
    "use strict";

    var config = {
        type:"search",
        name:"Search"
    };
    var render = function (config) {
        config = config || this.config;
        var result = $("<div ex:role='facet' ex:facetClass='TextSearch' class='exhibit-facet'></div>");
        if (config.name && config.name.length > 0) {
            result.attr("ex:facetLabel", config.name);
        }
        return result;

    };

    Freemix.facet.register(config,render);

})(window.Freemix.jQuery, window.Freemix);
