define(["jquery",
        "exhibit",
        "freemix/js/freemix",
        "display/views/registry",
        "ext/flot/flot-extension",
        "freemix/js/exhibit_utilities"],
    function ($, Exhibit, Freemix, ViewRegistry, FlotExtension) {
        "use strict";
    var config = {
        type: "piechart",
        name: "Pie Chart",
        properties: [],
        grouping: undefined
    };



    var render = function (config) {
        config = config || this.config;
        var expression = function(property){return "." + property;};

        var view = $("<div data-ex-role='view' data-ex-view-class='PieChart'></div>");
        view.attr("data-ex-label", config.name);
        view.attr("data-ex-grouping", expression(config.grouping));


        this._renderFormats(view);
        view.append(this._getLens(config).generateExhibitHTML());

        return view;
    };

    FlotExtension.register(Exhibit);
    return ViewRegistry.register(config, render);

});
