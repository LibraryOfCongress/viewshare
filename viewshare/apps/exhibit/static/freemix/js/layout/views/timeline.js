define(["jquery",
        "display/views/timeline",
        "ext/time/scripts/timeline-view"],
        function ($, View, TimelineView) {
        "use strict"

    View.prototype.label = "Timeline";
    View.prototype.thumbnail = "/static/freemix/img/timeline-icon.png";
    View.prototype.propertyTypes = ["date"];
    View.prototype.viewClass = TimelineView;
    View.prototype.template_name = "timeline-view-template";
    View.prototype.icon_class = "fa fa-align-center fa-3x";


    View.prototype.setupEditor = function (config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var start = template.find("#start_property");
        var end = template.find("#end_property");
        var color = template.find("#color_property");
        var top_band = template.find("#top-band-unit");
        var bottom_band = template.find("#bottom-band-unit");

        this._setupSelectPropertyHandler(config, template, top_band, "topBandUnit");
        this._setupSelectPropertyHandler(config, template, bottom_band, "bottomBandUnit");

        this._setupPropertySelect(config, template, start, "startDate", this.propertyTypes);
        this._setupPropertySelect(config, template, end, "endDate", this.propertyTypes, true);
        this._setupPropertySelect(config, template, color, "colorKey", [], true);
        this._setupLensEditor(config, template);


        top_band.change();
        bottom_band.change();
        start.change();
        end.change();
        color.change();
    };

    return View;
});