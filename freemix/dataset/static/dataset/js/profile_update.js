/*global jQuery */
(function($, Freemix) {

    function setupSaveButton() {
        $("#save_button").click(function() {
            var metadata = $.extend({},  Freemix.exhibit.exportDatabase(Freemix.exhibit.database), Freemix.profile);
            $("#save_message").empty().append("Saving...");
            var url = $(this).attr("href");
            var xhr = $.ajax({
                 type: "POST",
                 url: url,
                 data: $.toJSON(metadata),
                 success: function(data) {
                    window.location = $(String(data)).attr("href");
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