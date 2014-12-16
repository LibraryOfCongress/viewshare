define(["jquery",
        "display/lenses/registry",
        "display/exhibit-html-view",
        "freemix/js/freemix",
        "freemix/js/exhibit_utilities"],
    function($, LensRegistry,
             generateExhibitHTML,
             Freemix) {
    "use strict";

    function run_init(profile) {
        var data_urls = $("link[rel='exhibit-data']").toArray();
        Freemix.exhibit.initializeDatabase(data_urls, function() {
            if (profile.default_lens) {
                LensRegistry.setDefaultLens(LensRegistry.construct(profile.default_lens));
            }
            $("#contents").append(generateExhibitHTML(profile));
            Freemix.exhibit.createExhibit($("#contents"));
        });
    }

    return function() {
        var profile_url = $("link[rel='freemix/exhibit_profile']").attr("href");
        $.ajax({
            url: profile_url,
            type: "GET",
            dataType: "json",
            success: function(p) {
                run_init(p);
            }
        });

    };

});
