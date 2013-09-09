/*global jQuery */
(function($, Freemix) {

    function setupSaveButton() {
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

                     }
                 },
                 error: function (r, textStatus, error) {
                     $("#save_message").empty().append("Save Failed");
                 }
                });
            return false;
        });

    }

    $(document).ready(setupSaveButton)

})(window.Freemix.jQuery, window.Freemix);