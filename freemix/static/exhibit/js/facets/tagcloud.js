(function ($, Freemix, Exhibit) {
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
        var result = $("<div ex:role='facet' ex:facetClass='Cloud'  class='exhibit-facet exhibit-cloudFacet'></div>");
        result.attr("ex:expression", config.expression);
        if (config.name && config.name.length > 0) {
            result.attr("ex:facetLabel", config.name);
        }
        return result;
    };

    Freemix.facet.register(config,render);

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
