define(["jquery",
        "exhibit",
        "exhibit/js/views/registry",
        "ext/flot/flot-extension"],
    function ($, Exhibit, ViewRegistry, FlotExtension) {
        "use strict";
    var config = {
        type: "piechart",
        name: "Pie Chart",
        properties: []
    };

    var render = function (config) {
        config = config || this.config;

        var view = $("<div data-ex-role='view' data-ex-view-class='Piechart'></div>");
        view.attr("data-ex-view-label", config.name);
        view.attr("data-ex-group-properties", config.properties.join(', '));
        return view;
    };

    FlotExtension.register(Exhibit);
    return ViewRegistry.register(config, render);

});
