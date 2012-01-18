/*global jQuery */
(function($, Freemix) {

    function setupSaveButton() {
        var dialog = $('<div style="display:hidden"></div>').appendTo('body');

        dialog.dialog({
            width: 500,
            height: "auto",
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            title: "Save a New View"
        });

        function setupForm(dialog) {
            var form = dialog.find("form");

            form.ajaxForm({
                "target": dialog,
                "success": function() {
                    if (dialog.has(".exhibit_create_success").length > 0) {
                        dialog.append("<div>Redirecting...</div>");
                        window.location = dialog.find("a.exhibit_create_success").attr("href");
                    } else {
                        setupForm(dialog);
                    }
                    return false;

                }
            });
        }

        $("#save_button").click(function() {
                var url = $("link[rel='freemix/saveform']").attr("href");
                dialog.dialog("open");
                dialog.load(url, function (responseText, textStatus, XMLHttpRequest) {
                    setupForm(dialog);
                    dialog.find("#id_profile").val($.toJSON(Freemix.syncMetadata(Freemix.profile)));
                    $(".exhibit-create-form-cancel").click(function() {dialog.dialog("close");});
                });
                return false;
            });

    }

    $(document).ready(setupSaveButton)

})(window.Freemix.jQuery, window.Freemix);