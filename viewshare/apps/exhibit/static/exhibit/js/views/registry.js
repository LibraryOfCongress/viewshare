define(["freemix/js/lib/jquery", "exhibit/js/views/base"],
    function ($, BaseView) {
    "use strict";

    var prototypes = {};
    return {
        construct: function (type, config) {
            var Type = prototypes[type];
            return new Type(config);
        },
        register: function (config, render_function) {
            var View = function (config) {
                BaseView.call(this, config);
            };
            View.prototype = new BaseView();
            View.prototype.config = config;
            View.prototype.generateExhibitHTML = render_function;
            var type = config.type;
            prototypes[type] = View;
            return View;
        }
    };
});