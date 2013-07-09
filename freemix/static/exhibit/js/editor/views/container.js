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

    Freemix.view.container.getDialog = function() {
        return this._dialog;
    };

    Freemix.view.container.getPopupContent = function() {
        var container = this;

        var chooserThumbnails = $("<div><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button><h3 id='addWidgetModalLabel'>Select View Widget</h3></div></div>");


        $("<div class='chooser modal-body'></div>")
            .freemixThumbnails(Freemix.view.prototypes, function(View) {
                var view = new View();
                if (!view.config.id) {
                    view.config.id = $.make_uuid();
                }

                container.findWidget().one("edit-view", function() {
                    container.addView(view);
                });
                view.showEditor(container);
            }).appendTo(chooserThumbnails);
        return chooserThumbnails;
    };

    Freemix.view.container.getPopupButton = function() {
        return this.findWidget().find(".create-view-button");
    };

})(window.Freemix.jQuery, window.Freemix);
