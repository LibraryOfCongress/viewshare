(function ($, Freemix) {
    "use strict";

    var config = {
        type:"scatterplot",
        name: "Scatter Plot",
        title:undefined,
        titleLink:undefined,
        xaxis:undefined,
        yaxis:undefined,
        properties:[]
    };

    var render = function (config) {
        config = config || this.config;
        var expression = Freemix.exhibit.expression;

        if (typeof config.xaxis === "undefined" || typeof config.yaxis === "undefined") {
            return $('<div ex:role="view" ex:viewLabel="Axis Missing"></div>');
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
                return $("<div ex:role='view' ex:viewLabel='Unsupported Range Values'></div>");
            }
            if (maxy - miny <= 1 && maxy - miny > 0) {
                return $("<div ex:role='view' ex:viewLabel='Unsupported Range Values'></div>");
            }
        }

        var view = $("<div ex:role='view' ex:viewClass='Exhibit.ScatterPlotView'></div>");
        view.attr("ex:viewLabel", config.name);
        var prop;
        if (xaxis) {
            prop = database.getProperty(xaxis);
            view.attr("ex:x", expression(xaxis));
            view.attr("ex:xLabel", prop.getLabel());
        }
        if (yaxis) {
            prop = database.getProperty(yaxis);
            view.attr("ex:y", expression(yaxis));
            view.attr("ex:yLabel", prop.getLabel());
        }

        this._renderFormats(view);
        view.append(this._getLens().generateExhibitHTML());

        return view;
    };

    Freemix.view.register(config,render);

})(window.Freemix.jQuery, window.Freemix);
