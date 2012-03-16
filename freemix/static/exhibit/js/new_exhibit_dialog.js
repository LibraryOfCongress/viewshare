/*global jQuery */
(function($) {
    $.fn.newExhibitDialog = function(url) {

        return this.each(function() {
            $(this).click(function() {
                var dialog = $('<div style="display:hidden"></div>').appendTo('body');

                dialog.load(url, function (responseText, textStatus, XMLHttpRequest) {
                    dialog.dialog({
                        position: ["top", "center"],
                        width: "auto",
                        height: "auto",
                        modal: true,
                        draggable: false,
                        resizable: false,
                        title: "Pick a Canvas to Create a Data View"
                    });
                });
                return false;
            });
        });

    };
})(jQuery);