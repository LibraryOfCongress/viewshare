(function ($, Freemix) {
    "use strict";

    var config = {
        type:"thumbnail",
        name: "Gallery",
        image:undefined,
        title:undefined,
        titleLink:undefined,
        abbreviatedCount:"12",
        orders:[],
        possibleOrders:[]
    };

    function thumbnailLens(config) {
        var expression = Freemix.exhibit.expression;


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
    }

    var render = function (config) {
        config = config || this.config;

        var view = $("<div ex:role='view' ex:viewClass='Thumbnail'></div>");
        view.attr("ex:viewLabel", config.name);
        view.attr("ex:showAll", config.showAll);
        view.attr("ex:abbreviatedCount", config.abbreviatedCount);
        this._renderFormats(view);
        this._renderOrder(view, config);

        var lens = thumbnailLens(config);
        view.append(lens);

        return view;
    };

    Freemix.view.register(config,render);

})(window.Freemix.jQuery, window.Freemix);
