(function ($, Freemix) {
    "use strict";

    var Facet = Freemix.facet.prototypes.text;

    Facet.prototype.thumbnail = "/static/freemix/img/text-facet.png";
    Facet.prototype.label = "Text";

    Facet.prototype.refresh = function () {
        var facet = this;
        var result = $("<div class='text-facet-content'></div>");


        result.append(this.generateExhibitHTML());
        this.findWidget().find(".facet-content").empty().append(result);
        return result;
    };

    Facet.prototype.showEditor = function (facetContainer) {
        var facet = this;
        facetContainer = facetContainer || facet.findContainer();
        var template = Freemix.getTemplate("text-facet-editor");
        template.data("model", facet);
        $("textarea", template)
            .val(facet.config.text || "")
            .keyup(function () {
                $("#text-facet-preview", template).empty().creole($(this).val());
            });
        $("#text-facet-preview", template).creole(facet.config.text || "");

        facetContainer.getDialog().empty().append(template).dialog("option", {
            width:"640px",
            title:"Edit Text Facet",
            position:"center",
            buttons:{
                "Ok":function () {
                    var model = template.data("model");
                    model.config.text = template.find("textarea").val();
                    model.refresh();
                    facetContainer.findWidget().trigger("edit-facet");
                    facetContainer.getDialog().dialog("close");
                },

                "Cancel":function () {
                    $(this).dialog("close");
                }
            }
        }).dialog("option", "position", "center").dialog("open");

    };
    Facet.prototype.serialize = function () {
        return $.extend(true, {}, this.config);
    };

})(window.Freemix.jQuery, window.Freemix);
