define(["freemix/js/lib/jquery", "exhibit/js/views/registry"],
    function ($, ViewRegistry) {
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
            var minx = 0;
            var maxx = 0;
            var miny = 0;
            var maxy = 0;
            var recordIds = database.getAllItems().toArray();
            for (var i = 0; i < recordIds.length; i++) {
                var id = recordIds[i];
                var record = database.getItem(id);
                var x = parseFloat(record[xaxis]);
                var y = parseFloat(record[yaxis]);
                if (minx > x || i === 0) {
                    minx = x;
                }
                if (maxx < x || i === 0) {
                    maxx = x;
                }
                if (miny > y || i === 0) {
                    miny = y;
                }
                if (maxy < y || i === 0) {
                    maxy = y;
                }
            }
            if (maxx - minx <= 1 && maxx - minx > 0) {
                return $("<div data-ex-role='view' data-ex-view-label='Unsupported Range Values'></div>");
            }
            if (maxy - miny <= 1 && maxy - miny > 0) {
                return $("<div data-ex-role='view' data-ex-view-label='Unsupported Range Values'></div>");
            }
        }

        var view = $("<div data-ex-role='view' data-ex-view-class='Exhibit.ScatterPlotView'></div>");
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
