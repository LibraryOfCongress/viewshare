define([
    "jquery",
    "display/lenses/registry",
    "display/exhibit-html-view",
    "freemix/js/freemix",
    "freemix/js/exhibit_utilities"
], function(
    $,
    LensRegistry,
    generateExhibitHTML,
    Freemix
) {
    "use strict";

    function run_init(profile, data, target) {
        Freemix.exhibit.initializeDatabase(data, function() {
            if (profile.default_lens) {
                LensRegistry.setDefaultLens(LensRegistry.construct(profile.default_lens));
            }
            $(target).append(generateExhibitHTML(profile));
            Freemix.exhibit.createExhibit($(target));
        });
    };

    return function(target) {
        if (window.Freemix.profile && window.Freemix.data) {
            run_init(window.Freemix.profile, window.Freemix.data, target);
        }
    };
});
