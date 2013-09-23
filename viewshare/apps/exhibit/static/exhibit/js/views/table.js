(function ($, Freemix) {
    "use strict";

    var config = {
        type: "table",
        name: "Table",
        sortProperty: undefined,
        asc: true,
        properties: []
    };

    var render = function (config) {
        config = config || this.config;
        if (!config.properties || config.properties.length === 0) {
            return $("<div ex:role='view' ex:viewLabel='Columns Missing'></div>");
        }
        var view = $("<div ex:role='view' ex:viewClass='Tabular' ></div>");
        view.attr("ex:viewLabel", config.name);
        var labels = [];
        var columns = [];
        $.each(config.properties, function (index, p) {
            var property = Freemix.exhibit.database.getProperty(p);
            labels[labels.length] = property.getLabel();
            columns[columns.length] = Freemix.exhibit.expression(property.getID());

            if (config.sortProperty && config.sortProperty === p) {
                view.attr("ex:sortColumn", index);
            }
        });
        view.attr("ex:columnLabels", labels.join(', '));
        view.attr("ex:columns", columns.join(', '));
        view.attr("ex:sortAscending", config.asc);
        return view;
    };

    Freemix.view.register(config, render);

})(window.Freemix.jQuery, window.Freemix);

