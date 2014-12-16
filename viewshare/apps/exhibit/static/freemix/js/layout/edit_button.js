define(["jquery",
        "freemix/js/freemix",
        "bootstrap",
        "jquery.csrf",
        "jquery.form"],
    function($, Freemix) {
    "use strict";


    function setupEditButton() {

        $("#edit_button").click(function() {
            var metadata = Freemix.serialize();
            var link = $(this);
            $("#save_message").empty().append("Saving...");
            var url = link.attr("rel");
            var xhr = $.ajax({
                 url: url,
                 type: "POST",
                 data: $.toJSON(metadata),
                 contentType: "application/json",
                 success: function(data) {
                     window.location.href=link.attr("href");
                 },
                 error: function (r, textStatus, error) {
                     $("#save_message").empty().append("Save Failed");
                 }
                });
            return false;
        });


    }
    return setupEditButton;
});