/*global jQuery */
(function($, Freemix) {

    $.fn.freemixThumbnails = function(tags, items, clickHandler) {
        return this.each(function() {
            var list = $("<ul></ul>");
            $.each(tags,function(key, tag) {
                var item = items[tag];
                item.id = key;
                var li = $("<li></li>");
                var img = "<img src='" + item.thumbnail +
                                                    "' alt='" + item.label + "' title='" + item.label + "'/>";
                var label = $("<span class='chooser-item-name'>" +
                                    item.label + "</span>");
                if (item.isAvailable()) {
                    var body = $("<a href='' title='" + item.label + "'></a>").append(img).append(label);
                    body.click(function(e) {
                        clickHandler(item);
                        e.preventDefault();
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
            var facetContainer = $.extend({},Freemix.exhibit.facetContainer);
            facetContainer._selector = $(this);
            facetContainer.id = facetContainer.findWidget().attr("id");

            var w = facetContainer.findWidget();
            w.sortable({
               connectWith: ['#build .facet-container'],
               distance: 10,
               handle: '.facet-header',
               items: '.facet'
            });
            w.data("model", facetContainer);
            w.addClass("ui-widget-content").addClass("facet-container");
            w.append("<div class='create-facet ui-state-default'>" +
                "<div class='create-facet-button button button-icon-right' title='Add a Widget'>" +
                "<span class='ui-icon ui-icon-plus'></span><span class='label'>Add a Widget</span>" +
                "</div></div>");

            var dialog =$("<div style='display:hidden;'></div>").appendTo('body');
            facetContainer._dialog = dialog;
            dialog.dialog({
                width: 500,
                height: "auto",
                modal: true,
                draggable: false,
                resizable: false,
                autoOpen: false,
                title: "Select widget type",
                show: "fade",
                hide: "fade",
                close: function(event, ui) {
                    facetContainer.findWidget().off("edit-facet");
                }
            });

            w.find(".create-facet").click(function() {
                dialog.empty();
                dialog.append(facetContainer.getPopupContent());
                dialog.dialog("option", {
                    "title":"Select widget type",
                    "buttons": [],
                    "width": 500,
                    "position": "center"
                });
                dialog.dialog("open");
            });

        });
    };

    $.fn.viewContainer = function(properties) {
        return this.each(function() {
            var viewContainer = $.extend({}, Freemix.exhibit.viewContainer);
            viewContainer.id = $(this).attr("id");

            var model = $(this).data("model", viewContainer);
            model.append("<ul class='view-set'></ul>");
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
            set.append("<li class='create-view ui-state-default'>" +
                "<div class='create-view-button button button-icon-right'>" +
                "<span class='ui-icon ui-icon-plus'></span><span class='label'>Add a View</span>" +
                "</div></li>");

            var dialog =$("<div style='display:hidden;'></div>").appendTo('body');
            viewContainer._dialog = dialog;
            dialog.dialog({
                width: 500,
                height: "auto",
                modal: true,
                draggable: false,
                resizable: false,
                autoOpen: false,
                title: "Select view type",
                show: "fade",
                hide: "fade"
            });

            set.find(".create-view-button").click(function() {
                dialog.empty();
                dialog.append(viewContainer.getPopupContent());
                dialog.dialog("option", {
                    "title":"Select view type",
                    "buttons": [],
                    "width": 500,
                    "position": "center"
                });

                dialog.dialog("open");
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

    Freemix.syncMetadata = function(model) {
        var metadata = {};
        metadata.theme = model.theme;

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


        return metadata;
    };

    $.fn.generateExhibitHTML = function(model) {
        return this.each(function() {
            var root = $(this);

            root.find(".view-container").each(function() {
                var id = $(this).attr("id");
                var container = $("<div class='view-panel' ex:role='viewPanel'></div>");
                $.each(model.views[id], function() {
                    var view = Freemix.view.createView(this);
                    container.append(view.generateExhibitHTML());
                });

                root.find(".view-container#" + id).append(container);
            });

            $.each(model.facets, function(container, facets) {
                $.each(facets, function() {
                    var facet = Freemix.facet.createFacet(this);
                    root.find(".facet-container#" +container).append(facet.generateExhibitHTML());
                });
            });
        });
    };



    function updatePreview() {
        var metadata = Freemix.syncMetadata(Freemix.profile);
        Freemix.getPreview().empty();
        $("#canvas-template").clone().appendTo(Freemix.getPreview()).generateExhibitHTML(metadata);

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

        Freemix.property.initializeFreemix();
        // Setup Themeing
        var theme = Freemix.profile.theme;
        $("#theme").themeswitcher({
            loadTheme: Freemix.profile.theme,
            onSelect: function(theme) {
                Freemix.profile.theme = theme;
            }
        });

        var data = Freemix.data || $.map($("link[rel='exhibit/data']"), function(el) {return $(el).attr("href");});
        
        var database = Freemix.exhibit.initializeDatabase(data, function() {
            $(".view-container", Freemix.getBuilder()).viewContainer();
            $.each(profile.views, function(container, views) {
                $.each(views, function() {
                    var view = Freemix.view.createView(this);
                    Freemix.view.getViewContainer(container).addView(view);
                });
            });

            $(".facet-container", Freemix.getBuilder()).facetContainer();
            $.each(profile.facets, function(container, facets) {
                $.each(facets, function() {
                    var facet = Freemix.facet.createFacet(this);
                    Freemix.facet.getFacetContainer(container).addFacet(facet);
                });
            });


            new Freemix.Identify(database);
            togglePreview();
            $("#contents").show();
            Freemix.getBuilder().trigger("freemix.show-builder");
        });

    }

    function togglePreview() {
        if ($("#preview_toggle").attr("checked")) {
            updatePreview();

            $("#preview_toggle").button("option", "label", "Show Builder");
            $("#build, #theme").hide();
            $("#preview").show().createExhibit();
        } else {
            updateBuilder();

            $("#preview_toggle").button("option", "label", "Show Preview");
            $("#preview").hide();
            $("#build,#theme").show();
        }

    }

    function setup_ui() {

        $("#preview_toggle").button();
        $("#preview_toggle").change(function() {
            togglePreview();
        });

        $('.ui-state-default').hover(
            function(){
                $(this).addClass('ui-state-hover');
            }, function(){
                $(this).removeClass('ui-state-hover');
            }
        );
    }

    function display() {

        setup_ui();

        var profile_url = $("link[rel='freemix/exhibit_profile']").attr("href");
        $.ajax({
            url: profile_url,
            type: "GET",
            dataType: "json",
            success: function(p) {
                Freemix.profile = p;
                var dp_url = $("link[rel='freemix/dataprofile']").attr("href");
                $.ajax({
                    url: dp_url,
                    type: "GET",
                    dataType: "json",
                    success: function(dp) {
                        Freemix.data_profile=dp;
                        build_db();
                    }
                });
            }

        });

    }

    $(document).ready(function() {display();});

})(window.Freemix.jQuery, window.Freemix);
