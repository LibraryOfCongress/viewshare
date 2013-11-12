define(["freemix/js/lib/jquery", "exhibit/js/views/registry"],
    function ($, ViewRegistry) {
        "use strict";

    var config = {
        type:"map",
        name: "Map",
        title:undefined,
        titleLink:undefined,
        latlng:undefined,
        colorKey:undefined
    };

    var render = function (config) {
        config = config || this.config;
        if (!config.latlng) {
            return $("<div data-ex-role='view' data-ex-view-class='OLMap' ex:viewLabel='Location Missing'></div>");
        }
        var latlng = config.latlng;
        var colorKey = config.colorKey;
        var view = $("<div data-ex-role='view' data-ex-view-class='OLMap'></div>");
        view.attr("data-ex-osm-url", "http://tile.openstreetmap.org/${z}/${x}/${y}.png");
        view.attr("data-ex-view-label", config.name);
        if (latlng) {
            view.attr("data-ex-latlng", '.' + latlng);
        }
        if (colorKey) {
            view.attr("data-ex-color-key", '.' + colorKey);
        }
        if (config.zoom && config.zoom !== "") {
            view.attr("data-ex-zoom", config.zoom);
        }
        this._renderFormats(view);

        view.append(this._getLens(config).generateExhibitHTML());

        return view;
    };

    var View = ViewRegistry.register(config,render);
    View.prototype.viewClass = "Map";
    return View;

});
