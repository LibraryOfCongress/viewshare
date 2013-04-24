(function($, Freemix) {
    "use strict";

    Freemix.view.container.findWidget = function() {
        return $(".view-container#" + this.id, Freemix.getBuilder());
    };

    Freemix.view.container.getContent = function() {
        return $(".view-content", this.findWidget());
    };

    Freemix.view.container.serialize = function() {
        var config = [];
        $("ul.view-set>li", this.findWidget()).each(function() {
            if (!$(this).hasClass("create-view")) {
                var view = $(this).data("model");
                config.push(view.serialize());
            }
        });
        return config;
    };

    Freemix.view.container.addView = function(view) {
        $('.view-set li.create-view', this.findWidget()).before(view.findWidget());
    };

    Freemix.view.container.getSelected = function() {
        return this.findWidget().find(".view-set>li.ui-state-active");
    };

    Freemix.view.container.getPopupContent = function() {
        var fc = this;
        return $("<div class='chooser'></div>")
            .freemixThumbnails(Freemix.view.prototypes, function(View) {
                var view = new View();
                if (!view.config.id) {
                    view.config.id = $.make_uuid();
                }
                view.showEditor(fc);
            });
    };

    Freemix.view.container.getPopupButton = function() {
        return this.findWidget().find(".create-view-button");
    };

})(window.Freemix.jQuery, window.Freemix);
