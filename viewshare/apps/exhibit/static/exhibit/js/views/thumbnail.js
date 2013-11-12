define(["freemix/js/lib/jquery", "exhibit/js/views/registry"],
    function ($, ViewRegistry) {
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
    }

    var render = function (config) {
        config = config || this.config;

        var view = $("<div data-ex-role='view' data-ex-view-class='Thumbnail'></div>");
        view.attr("data-ex-view-label", config.name);
        view.attr("data-ex-show-all", config.showAll);
        view.attr("data-ex-abbreviated-count", config.abbreviatedCount);
        this._renderFormats(view);
        this._renderOrder(view, config);

        var lens = thumbnailLens(config);
        view.append(lens);

        return view;
    };

    return ViewRegistry.register(config,render);

});
