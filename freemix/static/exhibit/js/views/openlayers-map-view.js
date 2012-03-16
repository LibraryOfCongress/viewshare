/*global jQuery */
(function($, Freemix) {
    Freemix.view.addViewType($.extend(true, {}, Freemix.mapViewLib, {
        facetClass: Exhibit.OLMapView,
        viewClass: "OLMap",
        annotate: function(view) {
            view.attr("ex:osmURL", "http://tile.openstreetmap.org/${z}/${x}/${y}.png");
        }
    }));
})(window.Freemix.jQuery, window.Freemix);
