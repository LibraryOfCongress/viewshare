/*global jQuery */
(function($, Freemix) {

    Freemix.facet.addFacetType({
        facetClass: Exhibit.TextSearchFacet,
        thumbnail: "/static/exhibit/img/search-facet.png",
        label: "Search",
        config: {
            type: "search",
            name: "Search"
        },
        generateExhibitHTML: function (config) {
            config = config || this.config;
            var result = $("<div ex:role='facet' ex:facetClass='TextSearch' class='exhibit-facet'></div>");
            if (config.name && config.name.length > 0) {
                result.attr("ex:facetLabel", config.name);
            }
            return result;

        },
        showEditor: function(facetContainer) {
            var facet = this;
            var config = $.extend(true, {}, facet.config);
            var template = Freemix.getTemplate("search-facet-editor");
            facetContainer = facetContainer || facet.findContainer();
            var dialog = facetContainer.getDialog();
            template.data("model", this);
            template.find("form").submit(function() {return false;});

            function updatePreview() {
                var preview = $(facet.generateExhibitHTML(config));
                template.find("#facet-preview").empty().append(preview);
                var exhibit = Freemix.getBuilderExhibit();
                facet.facetClass.createFromDOM(preview.get(0), null, exhibit.getUIContext());

            }

            var label = template.find("#facet_name");
            label.val(config.name);
            label.change(function() {
                config.name = label.val();
                updatePreview();
            });
            dialog.empty().append(template).dialog("option", {
                title: "Edit Search",
                position: "center",
                buttons: [{
                   text: "Ok",
                   id: "ok-button",
                   click: function() {
                           var model = template.data("model");
                           model.config = config;
                           facetContainer.findWidget().trigger("edit-facet");
                           model.refresh();
                           facetContainer.getDialog().dialog("close");
                       }
                   },
                   {
                   text: "Cancel",
                   click: function() {
                           $(this).dialog("close");
                       }
                   }
              ]
            }).dialog("option", "position", "center");

            updatePreview();
            dialog.dialog("open");
        }
    });

})(window.Freemix.jQuery, window.Freemix);
