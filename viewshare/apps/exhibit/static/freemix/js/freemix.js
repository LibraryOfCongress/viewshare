define(["freemix/js/lib/jquery"], function($) {
    "use strict";
    var Freemix = window.Freemix || {};
    Freemix.jQuery = window.jQuery;
    window.Freemix = Freemix;
    Freemix.getTemplate = function (template) {
        return $($("#" + template).html());
    };
    return Freemix;
});
