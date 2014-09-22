define(["jquery",
        "exhibit",
        "handlebars",
        "display/views/registry",
        "display/facets/registry",
        "display/lenses/registry",
        "layout/views/container",
        "layout/facets/container",
        "display/exhibit-html-view",
        "layout/save_button",
        "layout/cancel_button",
        "layout/edit_button",
        "layout/modallinks",
        "freemix/js/freemix",
        "freemix/js/exhibit_utilities",
        "bootstrap"],
    function($,
             Exhibit,
             Handlebars,
             ViewRegistry,
             FacetRegistry,
             LensRegistry,
             ViewContainer,
             FacetContainer,
             generateExhibitHTML,
             setup_save_button,
             setup_cancel_button,
             setup_edit_button,
             ModalLinksView,
             Freemix) {
    "use strict";

    Freemix.getBuilder = function() {
        return $("#build");
    };

    Freemix.getPreview = function() {
        return $("#preview");
    };

    Freemix.getBuilderExhibit = function() {
        var exhibit = Freemix.getBuilder().data("exhibit");
        if (!exhibit) {
            exhibit = Exhibit.create(Freemix.exhibit.database);
            $(document).trigger("exhibitConfigured.exhibit", exhibit);

            Freemix.getBuilder().data("exhibit", exhibit);
        }
        return exhibit;
    };

   Freemix.serialize = function() {
       var metadata = {};

       metadata.facets = {};
       $(".facet-container", Freemix.getBuilder()).each( function() {
           var data = $(this).data("model");
           metadata.facets[$(this).attr("id")] = data.serialize();
       });

       metadata.views = {};
       $(".view-container",Freemix.getBuilder()).each( function() {
           var data = $(this).data("model");
           metadata.views[$(this).attr("id")] = data.serialize();
       });

       metadata.lenses = [];

       $.each(LensRegistry._array, function(inx, lens) {
           metadata.lenses.push(lens.serialize());
       });

       if (LensRegistry._default_lens) {
           metadata.default_lens = LensRegistry._default_lens.config;
       }
       return metadata;
   };

    function updateBuilder() {
        $(".view-container", Freemix.getBuilder()).each(function() {
            var container = $(this).data("model");
            var selected = container.getSelected();
            if (selected.length == 0) {
                selected = container.element.find(".view-set>li:first")
            }
            selected.data("model").select();
        });
    }

    function build_db() {
        var profile = Freemix.profile;

        var data = $("link[rel='exhibit-data']").toArray();
        Freemix.exhibit.initializeDatabase(data, function() {
            LensRegistry.setDefaultLens(LensRegistry.construct(Freemix.profile.default_lens));

            $(".view-container", Freemix.getBuilder()).each(function() {
                var element = $(this);
                var id = $(this).attr("id");
                var container = new ViewContainer({
                    id: id,
                    element: element
                });
                container.render();
            });
            $.each(profile.views, function(key, views) {
                $.each(views, function() {
                    var view = ViewRegistry.construct(this.type,this);

                    var container = $(".view-container#" + key, Freemix.getBuilder()).data("model");

                    container.addView(view);
                });
            });

            $(".facet-container", Freemix.getBuilder()).each(function() {
                var element = $(this);
                var id = $(this).attr("id");
                var container = new FacetContainer({
                    id: id,
                    element: element
                });
                container.render();
            });

            $.each(profile.facets, function(key, facets) {
                $.each(facets, function() {
                    var facet =  FacetRegistry.construct(this.type, this);
                    var container = $(".facet-container#" + key, Freemix.getBuilder()).data("model");

                    container.addFacet(facet);
                });
            });

            Freemix.getBuilder().collapse("show");

        });

    }

    function showBuilder() {
        $("#builder_button").addClass("active").siblings().each(function() {
            var selector = $(this).attr("data-target");
            $(selector).collapse("hide");
        });
        updateBuilder();
        Freemix.getBuilder().trigger("freemix.show-builder");
    }

    function hideBuilder() {
        $("#builder_button").removeClass("active");
    }

    function showPreview() {
        $("#preview_button").addClass("active").siblings().each(function() {
            var selector = $(this).attr("data-target");
            $(selector).collapse("hide");
        });

        var metadata = Freemix.serialize();
        var template = generateExhibitHTML(metadata);
        Freemix.getPreview().empty().append(template);
        Freemix.exhibit.createExhibit(template);

        hideBuilder();
    }

    function hidePreview() {
        $("#preview_button").removeClass("active");
    }

    function setup_ui() {
        $("#contents>.collapse").collapse({
            "parent": "#contents",
            "toggle": false
        });

        $("#build").on("show", showBuilder);
        $("#build").on("hide", hideBuilder);
        $("#preview").on("show", showPreview);
        $("#preview").on("hide", hidePreview);
        var links_view = new ModalLinksView({
            "selectors": $(".navbar a, #footer a")
        });
        links_view.render();
    }

    function display() {
        Exhibit.params.persist = false;
        setup_ui();
        setup_save_button();
        setup_cancel_button();
        setup_edit_button();
        var profile_url = $("link[rel='freemix/exhibit_profile']").attr("href");
        $.ajax({
            url: profile_url,
            type: "GET",
            dataType: "json",
            success: function(p) {
                Freemix.profile = p;
                build_db();

            }

        });



    }

    return display;
});
