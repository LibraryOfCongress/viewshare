define(["jquery",
    "display/lenses/registry",
    "freemix/js/exhibit_utilities",
    "freemix/js/lib/lightbox"
],
    function ($, LensRegistry) {
    "use strict";

    var config = {
        type: "thumbnail",
        name: "Thumbnail Lens",
        title: undefined,
        titleLink: undefined,
        image: undefined
    };

    var expression = function(property){return "." + property;};

    var render = function(config) {
        config = config || this.config;

        var lens = $("<div data-ex-role='lens' style='display:none;' class='image-thumbnail ui-state-highlight'></div>");
        var img = $("<a class='lightbox'><img class='image-thumbnail'/></a>");
        img.attr("data-ex-href-content", expression(config.image));
        img.find("img").attr("data-ex-src-content", expression(config.image));
        lens.append(img);
        if (config.title) {
            var title = $("<div class='name'><span></span></div>");
            var span = title.find("span");
            span.attr("data-ex-content", expression(config.title));
            if (config.titleLink) {
                span.wrap($("<a></a>").attr("data-ex-href-content", expression(config.titleLink)));
            }
            lens.append(title);

        }
        return lens;
    };

    return LensRegistry.register(config, render);

});
