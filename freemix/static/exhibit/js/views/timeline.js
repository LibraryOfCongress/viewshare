(function ($, Freemix) {
    "use strict";


    var config = {
        type:"timeline",
        name: "Timeline",
        title:undefined,
        titleLink:undefined,
        colorKey:undefined,
        startDate:undefined,
        endDate:undefined,
        topBandUnit:"auto",
        topBandPixelsPerUnit:undefined,
        bottomBandUnit:"auto",
        bottomBandPixelsPerUnit:undefined
    };


    var render = function (config) {
        var expression = Freemix.exhibit.expression;

        config = config || this.config;

        var lens = this._getLens(config);


        if (!config.startDate) {
            return $("<div ex:role='view' ex:viewLabel='Range Missing'></div>");
        }
        var colorKey = config.colorKey;
        var view = $("<div ex:role='view' ex:viewClass='Timeline'></div>");
        view.attr("ex:viewLabel", config.name);
        if (colorKey) {
            view.attr("ex:colorKey", expression(colorKey));
        }
        if (config.name) {
            view.attr("ex:label", config.name);
        }
        if (lens.config.title) {
            view.attr("ex:eventLabel", expression(lens.config.title));
        }
        if (config.startDate) {
            view.attr("ex:start", expression(config.startDate));
        }
        if (config.endDate) {
            view.attr("ex:end", expression(config.endDate));
        }
        if (config.topBandUnit && config.topBandUnit.length > 0 && config.topBandUnit !== "auto") {
            view.attr("ex:topBandUnit", config.topBandUnit);
        }
        if (config.bottomBandUnit && config.bottomBandUnit.length > 0 && config.bottomBandUnit !== "auto") {
            view.attr("ex:bottomBandUnit", config.bottomBandUnit);
        }
        if (config.topBandPixelsPerUnit) {
            view.attr("ex:topBandPixelsPerUnit", expression(config.topBandPixelsPerUnit));
        }
        if (config.bottomBandPixelsPerUnit) {
            view.attr("ex:bottomBandUnitsPerPixel", expression(config.bottomBandPixelsPerUnit));
        }

        this._renderFormats(view);
        view.append(lens.generateExhibitHTML());

        return view;
    };

    Freemix.view.register(config, render);

})(window.Freemix.jQuery, window.Freemix);
