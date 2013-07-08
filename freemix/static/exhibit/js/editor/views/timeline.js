(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["timeline"];

    View.prototype.label = "Timeline";
    View.prototype.thumbnail = "/static/exhibit/img/timeline-icon.png";
    View.prototype.propertyTypes = ["date"];
    View.prototype.viewClass = Exhibit.TimelineView;
    View.prototype.template_name = "timeline-view-template";


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
        top_band.change();
        bottom_band.change();

        var db = Freemix.exhibit.database;

        var dates = db.getPropertiesWithTypes(this.propertyTypes);
        var colors = db.getAllPropertyObjects();

        this._setupPropertySelect(config, template, start, "startDate", dates);
        this._setupPropertySelect(config, template, end, "endDate", dates, true);
        this._setupPropertySelect(config, template, color, "colorKey", colors, true);

        start.change();
        end.change();
        color.change();
        this._setupLensEditor(config, template);
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
