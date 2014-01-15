define(["jquery",
        "display/views/map",
        "ext/openlayers/scripts/openlayers-view",
        "handlebars",
        "text!templates/layout/views/map-view.html"],
        function ($, View, OLMapView, Handlebars, template_html) {
        "use strict"

    View.prototype.propertyTypes = ["location"];

    View.prototype.label = "Map";

    View.prototype.icon_class = "fa fa-globe fa-3x";

    View.prototype.viewClass = OLMapView;

    View.prototype.template = Handlebars.compile(template_html);

    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

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