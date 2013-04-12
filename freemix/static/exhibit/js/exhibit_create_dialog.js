/*global jQuery */
(function($, Freemix) {

    function setupSaveButton() {

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

            $.get(url).success(function(data) {
                var dialog = $(data).appendTo("body");
                setupForm(dialog);
                dialog.find("#id_profile").val($.toJSON(Freemix.syncMetadata(Freemix.profile)));
                    $(".exhibit-create-form-cancel").click(function() {dialog.modal("hide");});
                dialog.modal();

            });

            return false;
        });

    }

    $(document).ready(setupSaveButton);

})(window.Freemix.jQuery, window.Freemix);