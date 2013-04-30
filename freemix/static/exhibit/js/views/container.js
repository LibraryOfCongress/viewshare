(function($, Freemix) {
    "use strict";

    Freemix.view.container = {
        id: "",

        generateExhibitHTML: function() {
            var viewPanel = $("<div class='view-panel' ex:role='viewPanel'></div>");
            $("ul.view-set>li", this.findWidget()).each(function() {
                // TODO: the new view icon should be moved out of the list
                if (!$(this).hasClass("create-view")) {
                    var view = $(this).data("model");
                    viewPanel.append(view.generateExhibitHTML());
                }
            });
            return viewPanel;
        }
    };
})(window.Freemix.jQuery, window.Freemix);