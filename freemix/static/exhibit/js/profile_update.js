/*global jQuery */
(function($, Freemix) {

    function setupSaveButton() {
        $("#save_button").click(function() {
            var metadata = Freemix.syncMetadata(Freemix.profile);
            $("#save_message").empty().append("Saving...");
            var xhr = $.ajax({
                 type: "POST",
                 data: $.toJSON(metadata),
                 success: function(data) {
                    var url = $(String(data)).attr("href");
                    window.location = url;
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