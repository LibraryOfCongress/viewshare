define(["freemix/js/lib/jquery", "exhibit/js/views/registry"],
    function ($, ViewRegistry) {
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
            return $("<div data-ex-role='view' data-ex-view-label='Range Missing'></div>");
        }
        var colorKey = config.colorKey;
        var view = $("<div data-ex-role='view' data-ex-view-class='Timeline'></div>");
        view.attr("data-ex-view-label", config.name);
        if (colorKey) {
            view.attr("data-ex-color-key", expression(colorKey));
        }
        if (config.name) {
            view.attr("data-ex-label", config.name);
        }
        if (lens.config.title) {
            view.attr("data-ex-event-label", expression(lens.config.title));
        }
        if (config.startDate) {
            view.attr("data-ex-start", expression(config.startDate));
        }
        if (config.endDate) {
            view.attr("data-ex-end", expression(config.endDate));
        }
        if (config.topBandUnit && config.topBandUnit.length > 0 && config.topBandUnit !== "auto") {
            view.attr("data-ex-top-band-unit", config.topBandUnit);
        }
        if (config.bottomBandUnit && config.bottomBandUnit.length > 0 && config.bottomBandUnit !== "auto") {
            view.attr("data-ex-bottom-band-unit", config.bottomBandUnit);
        }
        if (config.topBandPixelsPerUnit) {
            view.attr("data-ex-top-band-pixels-per-unit", expression(config.topBandPixelsPerUnit));
        }
        if (config.bottomBandPixelsPerUnit) {
            view.attr("data-ex-bottom-band-units-per-pixel", expression(config.bottomBandPixelsPerUnit));
        }

        this._renderFormats(view);
        view.append(lens.generateExhibitHTML());

        return view;
    };

    return ViewRegistry.register(config, render);

});
