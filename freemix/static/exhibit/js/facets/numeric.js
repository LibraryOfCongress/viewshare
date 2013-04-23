(function ($, Freemix, Exhibit) {
    "use strict";

    var config = {
        name: "Range",
        type:"NumericRange",
        interval:10
    };

    var render = function (config) {
        config = config || this.config;
        var result = $("<div ex:role='facet' ex:facetClass='NumericRange'  class='exhibit-facet'></div>");
        result.attr("ex:expression", config.expression);
        if (config.name && config.name.length > 0) {
            result.attr("ex:facetLabel", config.name);
        }
        if (config.interval && config.interval > 0) {
            result.attr("ex:interval", config.interval);
        }

        return result;

    };

    Freemix.facet.register(config,render);

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
