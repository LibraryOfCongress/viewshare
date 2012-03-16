/*global jQuery */
 (function($, Freemix) {

      // Display the view's UI.
     function display() {
         var content = this.getContent();
         var root = Freemix.getTemplate("scatterplot-view-template");
         var model = this;
         content.empty();
         root.appendTo(content);

         model._setupViewForm();
         model._setupLabelEditor();
         model._setupTitlePropertyEditor();

         var numbers = Freemix.property.getPropertiesWithTypes(["number"]);

         var xaxis = content.find("#xaxis_property");
         var yaxis = content.find("#yaxis_property");

         model._setupPropertySelect(xaxis, "xaxis", numbers);
         model._setupPropertySelect(yaxis, "yaxis", numbers);
         xaxis.change();
         yaxis.change();
         model.findWidget().recordPager();

     }

    function generateExhibitHTML(config) {
        config = config || this.config;

        if (typeof config.xaxis === "undefined" || typeof config.yaxis === "undefined") {
            return $('<div ex:role="view" ex:viewLabel="Axis Missing"></div>');
        }

        var xaxis = config.xaxis;
        var yaxis = config.yaxis;
        if (xaxis && yaxis) {
            var minx = 0;
            var maxx = 0;
            var miny = 0;
            var maxy = 0;
            var database = Freemix.exhibit.database;
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
        var props = Freemix.property.propertyList;
        if (xaxis) {
            view.attr("ex:x", props[xaxis].expression());
            view.attr("ex:xLabel", props[xaxis].label());
        }
        if (yaxis) {
            view.attr("ex:y", props[yaxis].expression());
            view.attr("ex:yLabel", props[yaxis].label());
        }

        this._renderFormats(view);
        view.append(this._renderListLens(config));

        return view;
    }

    Freemix.view.addViewType({
        propertyTypes: ["number", "currency"],

        label: "Scatter Plot",
        thumbnail: "/static/exhibit/img/scatterplot-icon.png",
        display: display,
        generateExhibitHTML: generateExhibitHTML,

        config: {
            type: "scatterplot",
            title: undefined,
            titleLink: undefined,
            xaxis: undefined,
            yaxis: undefined,
            metadata: []
        }
    });

})(window.Freemix.jQuery, window.Freemix);
