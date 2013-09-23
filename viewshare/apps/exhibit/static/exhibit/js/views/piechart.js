(function ($, Freemix) {
    "use strict";

    var config = {
        type: "piechart",
        name: "Pie Chart",
        properties: []
    };

    var render = function (config) {
        config = config || this.config;

        var view = $("<div ex:role='view' ex:viewClass='Piechart'></div>");
        view.attr("ex:viewLabel", config.name);
        view.attr("ex:groupProperties", config.properties.join(', '));
        return view;
    };


    Freemix.view.register(config, render);

})(window.Freemix.jQuery, window.Freemix);
