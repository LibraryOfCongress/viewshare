(function ($, Freemix) {
    "use strict";

    var config = {
        type:"list",
        name: "List",
        title:undefined,
        titleLink:undefined,
        orders:[],
        possibleOrders:[],
        directions:["ascending"]
    };

    var render = function (config) {
        config = config || this.config;
        var lens = this._getLens(config);
        var view = $("<div ex:role='view'></div>");
        view.attr("ex:viewLabel", config.name);
        this._renderOrder(view, config);
        this._renderFormats(view);
        view.append(lens.generateExhibitHTML());
        return view;
    };

    Freemix.view.register(config,render);

})(window.Freemix.jQuery, window.Freemix);
