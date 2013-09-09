/*global jQuery */
(function($, Freemix) {

    function setupCancelButton() {
        $("#cancel_button").click(function() {
            var ajax_url = $(this).attr("rel");
            $("#save_message").empty().append("Cancelling...");

            var xhr = $.ajax({
                 url: ajax_url,
                 type: "DELETE",
                 success: function(data) {
                    window.location = $(String(data)).attr("href");
                 },
                 error: function (r, textStatus, error) {
                     $("#save_message").empty().append("Cancel Failed");
                 }
                });
            return false;
        });

    }
    $(document).ready(setupCancelButton);

})(window.Freemix.jQuery, window.Freemix);