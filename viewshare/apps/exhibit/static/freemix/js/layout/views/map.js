define(["jquery",
        "display/views/map",
        "ext/openlayers/scripts/openlayers-view"],
        function ($, View, OLMapView) {
        "use strict"

    View.prototype.propertyTypes = ["location"];

    View.prototype.label = "Map";

    View.prototype.thumbnail = "/static/freemix/img/map-icon.png";
    View.prototype.icon_class = "fa fa-globe fa-3x";

    View.prototype.viewClass = OLMapView;

    View.prototype.template_name = "map-view-template";

    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var db = Freemix.exhibit.database;
        var latlng = template.find("#latlng_property");
        this._setupPropertySelect(config, template, latlng, "latlng", ['location']);
        latlng.change();

        var color = template.find("#color_property");
        this._setupPropertySelect(config, template, color, "colorKey", [], true);
        color.change();

        var zoom = template.find("#zoom_level");
        this._setupSelectPropertyHandler(config, template, zoom, "zoom");
        zoom.change();

        this._setupLensEditor(config, template);
    };
    return View;
});