var Freemix = window.Freemix || {};
Freemix.jQuery = window.jQuery;
window.Freemix = Freemix;

(function($) {
    "use strict";
    Freemix.getTemplate = function (template) {
        return $($("#" + template).html());
    };
})(window.Freemix.jQuery);
