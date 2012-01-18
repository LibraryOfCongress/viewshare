/*global jQuery */
(function($, Freemix) {


    function setupExhibit(data) {
        var db = Freemix.exhibit.initializeDatabase([data], function () {
            new Freemix.Identify(db);
            $("#contents").show();
        });

    }

    function setupProfile(profile) {
        Freemix.profile = profile;
        Freemix.property.initializeDataProfile();
        var dataURL = $("link[rel='exhibit/data']").attr("href");
        setupExhibit(dataURL);

    }

    function setup() {
         var url = $(".dataset_create").attr("href");
        $(".dataset_create").newExhibitDialog(url);

        var profileURL = $("link[rel='freemix/dataprofile']").attr("href");
        $.ajax({
            url: profileURL,
            type: "GET",
            dataType: "json",
            success: function(data) {
                setupProfile(data);
            }
        });


    }
    $(document).ready(setup);
})(window.Freemix.jQuery, window.Freemix);