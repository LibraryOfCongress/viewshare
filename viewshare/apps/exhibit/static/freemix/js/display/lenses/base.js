define(["jquery", "freemix/js/widget"], function ($, Widget) {
    "use strict";

    var BaseLens = function (config) {
        Widget.call(this, config);
    };

    BaseLens.prototype = new Widget();

    BaseLens.prototype.generateExhibitHTML = function (config) {};

    return BaseLens;
});
