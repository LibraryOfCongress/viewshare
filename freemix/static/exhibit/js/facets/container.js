(function($, Freemix) {
    "use strict";

    Freemix.facet.container = {
        id: "",
        generateExhibitHTML: function() {
            var result = "";
             this.findWidget().find(".facet").each(function() {
                 result += $(this).data("model").generateExhibitHTML();
            });
            return result;
        }
    };
})(window.Freemix.jQuery, window.Freemix);
