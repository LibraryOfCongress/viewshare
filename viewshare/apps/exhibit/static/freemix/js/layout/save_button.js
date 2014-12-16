define(["jquery",
        "freemix/js/freemix",
        "bootstrap",
        "jquery.csrf",
        "jquery.form"],
    function($, Freemix) {
    "use strict";

    function setupForm(root) {
        root.find("form").ajaxForm({
            "success": function(response, status, xhr, form) {
                var html = $(response);

                if (html.prop("tagName") === "A" &&
                    html.attr("rev")) {
                    window.location.href = html.attr("rev");
                } else {
                    root.html(html);
                    setupForm(root);
                }
            }
        });
    }

    function setupSaveButton() {
        var modal = $("#publish-exhibit-modal");

        $("#save_button").click(function() {
            var metadata = Freemix.serialize();
            $("#save_message").empty().append("Saving...");
            var url = $(this).attr("rel");
            var xhr = $.ajax({
                 url: url,
                 type: "POST",
                 data: $.toJSON(metadata),
                 contentType: "application/json",
                 success: function(data) {
                     var result = $(String(data));
                     if (result.prop("tagName") === "A" &&
                         result.attr("rev")) {
                         window.location.href = result.attr("rev");
                     } else {
                         var root = modal.find("#publish-exhibit-form-template");
                         root.empty().append(result);
                         setupForm(root);
                         modal.modal('show');
                     }
                 },
                 error: function (r, textStatus, error) {
                     $("#save_message").empty().append("Save Failed");
                 }
                });
            return false;
        });

        modal.modal({
            show: false
        });

    }
    return setupSaveButton;
});