define(["jquery"], function($) {
    "use strict";
    var Freemix = window.Freemix || {};
    window.Freemix = Freemix;
    Freemix.getTemplate = function (template) {
        return $($("#" + template).html());
    };
    return Freemix;
});
