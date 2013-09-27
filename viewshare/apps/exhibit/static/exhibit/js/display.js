define(["freemix/js/lib/jquery", "freemix/js/freemix"], function($, Freemix) {
    "use strict";

    $.fn.generateExhibitHTML = function(model) {

        return this.each(function() {
            var root = $(this);

            root.find(".view-container").each(function() {
                var id = $(this).attr("id");
                var container = $("<div class='view-panel' ex:role='viewPanel'></div>");
                $.each(model.views[id], function() {
                    var view = new Freemix.view.construct(this.type,this);
                    container.append(view.generateExhibitHTML());
                });

                root.find(".view-container#" + id).append(container);
            });

            $.each(model.facets, function(container, facets) {
                $.each(facets, function() {
                    var facet = Freemix.facet.construct(this.type, this);
                    root.find(".facet-container#" +container).append(facet.generateExhibitHTML());
                });
            });
            $('body').trigger('initialized.exhibit');

        });
    };

    function run_init(profile, nextFn) {
        var data = Freemix.data || $.map($("link[rel='exhibit/data']"), function(el) {return $(el).attr("href");});

        Freemix.exhibit.initializeDatabase(data, function() {
//            Freemix.lens.setDefaultLens(Freemix.lens.construct(profile.default_lens));
            $("#canvas").generateExhibitHTML(profile).createExhibit();
        });

        if (typeof nextFn != "undefined") {
            nextFn();
        }
    }

    Freemix.initialize = function(callback) {
        var profile_url = $("link[rel='freemix/exhibit_profile']").attr("href");
        $.ajax({
            url: profile_url,
            type: "GET",
            dataType: "json",
            success: function(p) {
                run_init(p,callback);
            }
        });


    };


});
