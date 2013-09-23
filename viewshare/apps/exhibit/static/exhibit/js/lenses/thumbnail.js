(function($, Freemix) {
    "use strict";

    var config = {
        type: "thumbnail",
        name: "Thumbnail Lens",
        title: undefined,
        titleLink: undefined,
        image: undefined
    };

    var expression = Freemix.exhibit.expression;

    var render = function(config) {
        config = config || this.config;

        var lens = $("<div ex:role='lens' style='display:none;' class='image-thumbnail ui-state-highlight'></div>");
        var img = $("<a class='lightbox'><img class='image-thumbnail'/></a>");
        img.attr("ex:href-content", expression(config.image));
        img.find("img").attr("ex:src-content", expression(config.image));
        lens.append(img);
        if (config.title) {
            var title = $("<div class='name'><span></span></div>");
            var span = title.find("span");
            span.attr("ex:content", expression(config.title));
            if (config.titleLink) {
                span.wrap($("<a></a>").attr("ex:href-content", expression(config.titleLink)));
            }
            lens.append(title);

        }
        return lens;
    };

    Freemix.lens.register(config, render);

})(window.Freemix.jQuery, window.Freemix);
