define(["jquery",
        "exhibit",
        "freemix/js/freemix",
        "freemix/js/views/registry",
        "ext/flot/flot-extension",
        "freemix/js/exhibit_utilities"],
    function ($, Exhibit, Freemix, ViewRegistry, FlotExtension) {
        "use strict";
    var config = {
        type: "barchart",
        name: "Bar Chart",
        properties: [],
        grouping: undefined
    };



    var render = function (config) {
        config = config || this.config;
        var expression = Freemix.exhibit.expression;

        var view = $("<div data-ex-role='view' data-ex-view-class='BarChart'></div>");
        view.attr("data-ex-label", config.name);
        view.attr("data-ex-grouping", expression(config.grouping));

        this._renderFormats(view);
        view.append(this._getLens(config).generateExhibitHTML());

        return view;
    };

    FlotExtension.register(Exhibit);
    return ViewRegistry.register(config, render);

});
