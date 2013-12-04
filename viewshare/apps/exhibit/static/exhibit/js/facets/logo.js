define(["jquery",
        "exhibit/js/facets/registry"],
    function ($, FacetRegistry) {
        "use strict";

        var config = {
        type:"logo",
        name: "Logo",
        src:undefined,
        alt:undefined,
        href:undefined,
        width:undefined,
        height:undefined
    };

    var render = function(config) {
        var p;
        config = config || this.config;
        var img = $("<img/>");
        if (config.src) {
            img.attr("src", config.src);
        }
        if (config.alt) {
            img.attr("alt", config.alt);
        }
        if (config.width) {
            img.attr("style", "max-width:" + config.width + "px");
        }
        if (config.href) {
            var link = $("<a/>");
            link.attr("href", config.href);
            link.attr("target", "_blank");
            link.append(img);
            p = $("<span/>");
            p.append(link);
            return p.html();
        }
        var s = $("<span/>");
        s.append(img);
        p = $("<span/>");
        p.append(s);
        return p.html();
    };

    return FacetRegistry.register(config,render);

});
