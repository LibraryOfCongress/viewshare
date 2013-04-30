(function($, Freemix) {
    "use strict";

    Freemix.exhibit = Freemix.exhibit || {};

    Freemix.Widget = function(config) {
        this.config = $.extend(true, {}, this.config, config);
    };

    Freemix.Widget.prototype = {
        config: {
            name: ""
        }
    };

})(window.Freemix.jQuery, window.Freemix);
