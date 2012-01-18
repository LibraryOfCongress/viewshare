/*global jQuery */
(function($, Freemix) {
    Freemix.view.addViewType($.extend(true, {}, Freemix.mapViewLib, {
        facetClass: Exhibit.OLMapView,
        viewClass: "OLMap"
    }));
})(window.Freemix.jQuery, window.Freemix);
