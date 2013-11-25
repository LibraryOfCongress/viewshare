define(["jquery"], function ($) {
    "use strict";

    var Widget = function(config) {
        this.config = $.extend(true, {}, this.config, config);
    };

    Widget.prototype = {
        config: {
            name: ""
        }
    };

    return Widget;
});
