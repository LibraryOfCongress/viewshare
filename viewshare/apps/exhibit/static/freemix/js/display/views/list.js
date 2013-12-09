define(["jquery", "display/views/registry"],
    function ($, ViewRegistry) {
    "use strict";

    var config = {
        type:"list",
        name: "List",
        title:undefined,
        titleLink:undefined,
        orders:[],
        possibleOrders:[],
        directions:["ascending"],
        paginate: true
    };

    var render = function (config) {
        config = config || this.config;
        var lens = this._getLens(config);
        var view = $("<div data-ex-role='view'></div>");
        view.attr("data-ex-view-label", config.name);
        view.attr("data-ex-showAll", false);
        view.attr("data-ex-grouped", false);
        this._renderOrder(view, config);
        this._renderFormats(view);
        view.append(lens.generateExhibitHTML());
        return view;
    };

    return ViewRegistry.register(config,render);

});
