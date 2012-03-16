/*global jQuery */
(function($, Freemix) {


    function setupForm(dialog) {
        var form = dialog.find("form");

        form.ajaxForm({
            "target": dialog,
            "success": function() {
                if (dialog.has(".dataset_create_success").length > 0) {
                    dialog.append("<div>Redirecting...</div>");
                    window.location = dialog.find("a.dataset_create_success").attr("href");
                } else {
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
            title: "Save a New Dataset"
        });

        $("#save_button").click(function() {
                var url = $("link[rel='freemix/saveform']").attr("href");
                dialog.dialog("open");
                dialog.load(url, function (responseText, textStatus, XMLHttpRequest) {
                    setupForm(dialog);

                    dialog.find("#id_profile").val($.toJSON(Freemix.profile));
                    dialog.find("#id_data").val($.toJSON(Freemix.exhibit.exportDatabase(Freemix.exhibit.database)));

                    $(".dataset-create-form-cancel").click(function() {dialog.dialog("close");});
                });
                return false;
            });

    }

    $(document).ready(setupSaveButton)

})(window.Freemix.jQuery, window.Freemix);