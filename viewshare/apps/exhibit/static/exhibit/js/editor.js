define(["jquery",
        "exhibit/js/views/registry",
        "exhibit/js/facets/registry",
        "exhibit/js/lenses/registry",
        "exhibit/js/editor/views/container",
        "exhibit/js/editor/facets/container",
        "exhibit/js/editor/save_button",
        "exhibit/js/editor/cancel_button",
        "freemix/js/freemix",
        "jquery-ui",
        "bootstrap"],
    function($, ViewRegistry, FacetRegistry,
             LensRegistry, ViewContainer,
             FacetContainer,
             setup_save_button,
             setup_cancel_button,
             Freemix) {
    "use strict";

    $.fn.freemixThumbnails = function(items, clickHandler) {
        return this.each(function() {
            var list = $("<ul class='thumbnails'></ul>");
            $.each(items,function(key, type) {
                var proto = type.prototype;
                var li = $("<li class='span2'></li>");
                var img = "<img src='" + proto.thumbnail +
                    "' alt='" + proto.label + "' title='" + proto.label + "'/>";
                var label = $("<legend class='chooser-item-name'>" +
                                    proto.label + "</legend>");
                if (proto.isAvailable()) {
                    var body = $("<a class='thumbnail' href='' title='" + proto.label + "'></a>").append(img).append(label);
                    body.click(function(e) {
                            e.preventDefault();
                            clickHandler(type);
                        });
                    li.append(body);
                } else {
                    li.addClass("disabled");
                    li.append(img).append(label);
                }
                li.appendTo(list);
            });
            list.appendTo($(this));
        });
    };
    $.fn.facetContainer = function(properties) {
        return this.each(function() {
            var id = $(this).attr("id");
            var facetContainer = new FacetContainer(id);

            var w = facetContainer.findWidget();
            w.sortable({
               connectWith: ['#build .facet-container'],
               distance: 10,
               handle: '.facet-header',
               items: '.facet'
            });
            w.data("model", facetContainer);
            w.addClass("ui-widget-content").addClass("facet-container");
            w.append("<div class='create-facet'>" +
                "<button class='create-facet-button btn btn-small btn-info' href='#addWidgetModal_" + id + "' data-toggle='modal'><i class='icon-plus'></i> Add a Widget</button>" +
                "</div>");

            var dialog =$("<div id='addWidgetModal_" + id + "' class='widget-editor modal hide fade' tabindex='-1' role='dialog' aria-labelledby='addWidgetModalLabel' aria-hidden='true'>" +
                          "</div>").appendTo('body');

            dialog.modal({
                show:false
            });

            dialog.on("show", function() {
                Freemix.getBuilder().hide();
            });

            dialog.on("hidden", function() {
                Freemix.getBuilder().show();
            });

            facetContainer._dialog = dialog;

            w.find(".create-facet").click(function() {
                dialog.empty();
                dialog.append(facetContainer.getPopupContent());

            });
        });
    };

    $.fn.viewContainer = function(properties) {
        return this.each(function() {

            var id = $(this).attr("id");
            var viewContainer = new ViewContainer(id);
            var model = $(this).data("model", viewContainer);
            model.append("<ul class='view-set nav nav-tabs'></ul>");
            model.append("<div class='view-content'></div>");
            model.addClass("view-container");

            var set = model.find(".view-set");
            set.sortable({
                    // axis: "x",
                    tolerance: "pointer",
                    distance: 10,
                    connectWith: ".view-container>ul",
                    cancel: "li.create-view, .bt-wrapper",
                    items: "li:not(.create-view)",
                    receive: function(event, ui) {
                        $(ui.item).data("model")._container = undefined;
                    }
                });
            set.append("<li class='create-view'>" +
                       "<button class='create-view-button btn btn-small btn-info' href='#addViewModal' data-toggle='modal'><i class='icon-plus'></i> Add a View</button>" +
                       "</li>");

            var dialog =$("<div id='addViewModal' class='widget-editor modal hide fade' tabindex='-1' role='dialog' aria-labelledby='addViewModalLabel' aria-hidden='true'>" +
                          "</div>").appendTo('body');

            dialog.modal({
                show:false
            });

            dialog.on("show", function() {
                Freemix.getBuilder().hide();
            });

            dialog.on("hidden", function() {
                Freemix.getBuilder().show();
            });

            viewContainer._dialog = dialog;


            set.find(".create-view-button").click(function() {
                dialog.empty();
                dialog.append(viewContainer.getPopupContent());
            });
        });
    };

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


    $.fn.generateExhibitHTML = function(model) {
        return this.each(function() {
            var root = $(this);

            root.find(".view-container").each(function() {
                var id = $(this).attr("id");
                var container = $("<div class='view-panel' data-ex-role='viewPanel'></div>");
                $.each(model.views[id], function() {
                    var view = ViewRegistry.construct(this.type,this);
                    container.append(view.generateExhibitHTML());
                });

                root.find(".view-container#" + id).append(container);
            });

            $.each(model.facets, function(container, facets) {
                $.each(facets, function() {
                    var facet = FacetRegistry.construct(this.type, this);
                    root.find(".facet-container#" +container).append(facet.generateExhibitHTML());
                });
            });
        });
    };

    function updatePreview() {
        var metadata = Freemix.serialize();
        Freemix.getPreview().empty();
        Freemix.getTemplate("canvas-template").appendTo(Freemix.getPreview()).generateExhibitHTML(metadata);
    }

    function updateBuilder() {
        $(".view-container", Freemix.getBuilder()).each(function() {
            var container = $(this).data("model");
            var selected = container.getSelected();
            if (selected.size() == 0) {
                selected = container.findWidget().find(".view-set>li:first")
            }
            selected.data("model").select();
        });
    }
    function build_db() {
        var profile = Freemix.profile;

        var data = $("link[rel='exhibit/data']").toArray();
        Freemix.exhibit.initializeDatabase(data, function() {
            LensRegistry.setDefaultLens(LensRegistry.construct(Freemix.profile.default_lens));

            $(".view-container", Freemix.getBuilder()).viewContainer();
            $.each(profile.views, function(key, views) {
                $.each(views, function() {
                    var view = ViewRegistry.construct(this.type,this);

                    var container = $(".view-container#" + key, Freemix.getBuilder()).data("model");

                    container.addView(view);
                });
            });

            $(".facet-container", Freemix.getBuilder()).facetContainer();
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
        updatePreview();
        $("#preview").createExhibit();
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
    }

    function display() {

        setup_ui();
        setup_save_button();
        setup_cancel_button();
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
