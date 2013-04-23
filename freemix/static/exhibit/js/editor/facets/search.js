(function ($, Freemix, Exhibit) {
    "use strict";

    var Facet = Freemix.facet.prototypes.search;

    Facet.prototype.facetClass = Exhibit.TextSearchFacet;
    Facet.prototype.thumbnail = "/static/freemix/img/search-facet.png";
    Facet.prototype.label = "Search";
    Facet.prototype.template_name = "search-facet-editor";

    Facet.prototype.setupEditor = function(config, template) {
        var facet = this;

        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function() {
            config.name = label.val();
            template.trigger("update-preview");
        });

    };
})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
