/*global jQuery */

(function($, Freemix) {

     var creole = new Parse.Simple.Creole({
         forIE: document.all,
         interwiki: {

         },
         linkFormat: ''
       });
     $.fn.creole = function(text) {

         return this.each(function() {
             if (text) {
                 creole.parse($(this).get(0), text);
            }
         });


     };

     Freemix.facet.addFacetType({
        thumbnail: "/static/exhibit/img/text-facet.png",
        label: "Text",
        config: {
            type: "text",
            text: undefined
        },
        generateExhibitHTML: function() {
            return $("<div class='text-facet exhibit-facet'>").creole(this.config.text);

        },

        refresh: function() {
            var facet = this;
            var result = $("<div class='text-facet-content'></div>");


            result.append(this.generateExhibitHTML());
            this.findWidget().find(".facet-content").empty().append(result);
            return result;
        },
        showEditor: function(facetContainer) {
            var facet = this;
            facetContainer = facetContainer || facet.findContainer();
            var template = Freemix.getTemplate("text-facet-editor");
            template.data("model", facet);
            $("textarea", template)
                .val(facet.config.text || "")
                .keyup(function() {
                    $("#text-facet-preview", template).empty().creole($(this).val());
                });
            $("#text-facet-preview", template).creole(facet.config.text || "");

            facetContainer.getDialog().empty().append(template).dialog("option", {
                width: "640px",
                title: "Edit Text Facet",
                position: "center",
                buttons: {
                     "Ok": function() {
                         var model = template.data("model");
                         model.config.text = template.find("textarea").val();
                         model.refresh();
                         facetContainer.findWidget().trigger("edit-facet");
                         facetContainer.getDialog().dialog("close");
                     },

                     "Cancel": function() {
                         $(this).dialog("close");
                     }
                }
            }).dialog("option", "position", "center").dialog("open");

        },
        serialize: function() {
            return $.extend(true, {}, this.config);
        }

    });

})(window.Freemix.jQuery, window.Freemix);
