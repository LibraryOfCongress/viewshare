define(["jquery", "exhibit/js/views/registry",
        "freemix/js/exhibit_utilities"],
    function ($, ViewRegistry) {
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
            return $("<div data-ex-role='view' data-ex-view-label='Columns Missing'></div>");
        }
        var view = $("<div data-ex-role='view' data-ex-view-class='Tabular' ></div>");
        view.attr("data-ex-view-label", config.name);
        var labels = [];
        var columns = [];
        $.each(config.properties, function (index, p) {
            var property = Freemix.exhibit.database.getProperty(p);
            labels[labels.length] = property.getLabel();
            columns[columns.length] = Freemix.exhibit.expression(property.getID());

            if (config.sortProperty && config.sortProperty === p) {
                view.attr("data-ex-sort-column", index);
            }
        });
        view.attr("data-ex-column-labels", labels.join(', '));
        view.attr("data-ex-columns", columns.join(', '));
        view.attr("data-ex-sort-ascending", config.asc);
        return view;
    };

    return ViewRegistry.register(config, render);

});

