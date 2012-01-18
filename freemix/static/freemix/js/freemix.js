/*global jQuery, window, alert, console */

(function (window) {
var Freemix = window.Freemix || {};
Freemix.jQuery = window.jQuery;
window.Freemix = Freemix;
})(window);



 (function($) {
     Freemix.getTemplate = function(template) {
        return $($("#templates div#" + template).html());
     };
})(window.Freemix.jQuery);
