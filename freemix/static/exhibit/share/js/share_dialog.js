/*global jQuery */
(function($) {


    function setupForm(dialog) {
        var form = dialog.find("form");

        form.ajaxForm({
            "target": dialog,
            "success": function() {
                if (dialog.has("form").length > 0) {
                    setupForm(dialog);
                }
                return false;

            }
        });
    }

    function setupSaveButton() {
        var dialog = $('<div style="display:hidden"></div>').appendTo('body');

        dialog.dialog({
            width: 500,
            height: "auto",
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            title: "Create a New Shared Link"
        });

        $("a.exhibit_share").click(function() {
                var url = $(this).attr("href");
                dialog.dialog("open");
                dialog.load(url, function (responseText, textStatus, XMLHttpRequest) {
                    setupForm(dialog);

                    $(".shared-key-form-cancel").click(function() {dialog.dialog("close");});
                });
                return false;
            });

    }

    $(".shared-key-url").live("click", function() {
        $(this).select();
    });

    $(document).ready(setupSaveButton)

})(jQuery);