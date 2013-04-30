(function ($, Freemix) {
    "use strict";


    var config = {
        type:"map",
        name: "Map",
        title:undefined,
        titleLink:undefined,
        latlng:undefined,
        colorKey:undefined,
        properties:[]
    };

    var render = function (config) {
        config = config || this.config;
        if (!config.latlng) {
            return $("<div ex:role='view' ex:viewClass='OLMap' ex:viewLabel='Location Missing'></div>");
        }
        var latlng = config.latlng;
        var colorKey = config.colorKey;
        var view = $("<div ex:role='view' ex:viewClass='OLMap'></div>");
        view.attr("ex:osmURL", "http://tile.openstreetmap.org/${z}/${x}/${y}.png");
        view.attr("ex:viewLabel", config.name);
        if (latlng) {
            view.attr("ex:latlng", '.' + latlng);
        }
        if (colorKey) {
            view.attr("ex:colorKey", '.' + colorKey);
        }
        if (config.zoom && config.zoom !== "") {
            view.attr("ex:zoom", config.zoom);
        }
        this._renderFormats(view);

        view.append(this._getLens().generateExhibitHTML());

        return view;
    };

    var View = Freemix.view.register(config,render);
    View.prototype.viewClass = "Map";

})(window.Freemix.jQuery, window.Freemix);
