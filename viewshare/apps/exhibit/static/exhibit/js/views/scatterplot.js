define(["jquery",
        "freemix/js/freemix",
        "exhibit/js/views/registry",
        "freemix/js/exhibit_utilities"],
    function ($,Freemix, ViewRegistry) {
        "use strict";

    var config = {
        type:"scatterplot",
        name: "Scatter Plot",
        title:undefined,
        titleLink:undefined,
        xaxis:undefined,
        yaxis:undefined
    };

    var render = function (config) {
        config = config || this.config;
        var expression = Freemix.exhibit.expression;

        if (typeof config.xaxis === "undefined" || typeof config.yaxis === "undefined") {
            return $('<div data-ex-role="view" data-ex-view-label="Axis Missing"></div>');
        }

        var xaxis = config.xaxis;
        var yaxis = config.yaxis;
        var database = Freemix.exhibit.database;

        if (xaxis && yaxis) {
            var minx = NaN;
            var maxx = NaN;
            var miny = NaN;
            var maxy = NaN;

            var records = database.getAllItems();
            records.visit(function(record) {
                var x = parseFloat(record[xaxis]);
                var y = parseFloat(record[yaxis]);
                if (minx > x || minx == NaN) {
                    minx = x;
                }
                if (maxx < x || maxx == NaN) {
                    maxx = x;
                }
                if (miny > y || miny == NaN) {
                    miny = y;
                }
                if (maxy < y || maxy == NaN) {
                    maxy = y;
                }
            });

            if ((maxx - minx <= 1 && maxx - minx > 0)
                || (maxy - miny <= 1 && maxy - miny > 0)
                || (maxx == NaN || maxy == NaN || minx == NaN || miny == NaN)) {
                return $("<div data-ex-role='view' data-ex-view-label='Unsupported Range Values'></div>");
            }
        }

        var view = $("<div data-ex-role='view' data-ex-view-class='ScatterPlot'></div>");
        view.attr("data-ex-view-label", config.name);
        var prop;
        if (xaxis) {
            prop = database.getProperty(xaxis);
            view.attr("data-ex-x", expression(xaxis));
            view.attr("data-ex-x-label", prop.getLabel());
        }
        if (yaxis) {
            prop = database.getProperty(yaxis);
            view.attr("data-ex-y", expression(yaxis));
            view.attr("data-ex-y-label", prop.getLabel());
        }

        this._renderFormats(view);
        view.append(this._getLens(config).generateExhibitHTML());

        return view;
    };

    return ViewRegistry.register(config,render);

});
