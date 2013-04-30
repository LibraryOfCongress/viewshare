(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["timeline"];

    View.prototype.label = "Timeline";
    View.prototype.thumbnail = "/static/exhibit/img/timeline-icon.png";
    View.prototype.propertyTypes = ["date"];
    View.prototype.viewClass = Exhibit.TimelineView;

    // Display the view's UI.
    View.prototype.display = function () {
        var content = this.getContent();
        var root = Freemix.getTemplate("timeline-view-template");
        content.empty();
        root.appendTo(content);
        var model = this;

        model._setupViewForm();
        model._setupLabelEditor();

        var start = content.find("#start_property");
        var end = content.find("#end_property");
        var color = content.find("#color_property");
        var top_band = content.find("#top-band-unit");
        var bottom_band = content.find("#bottom-band-unit");

        this._setupSelectPropertyHandler(top_band, "topBandUnit");
        this._setupSelectPropertyHandler(bottom_band, "bottomBandUnit");
        top_band.change();
        bottom_band.change();

        var db = Freemix.exhibit.database;

        var dates = db.getPropertiesWithTypes(model.propertyTypes);
        var colors = db.getAllPropertyObjects();

        model._setupPropertySelect(start, "startDate", dates);
        model._setupPropertySelect(end, "endDate", dates, true);
        model._setupPropertySelect(color, "colorKey", colors, true);

        start.change();
        end.change();
        color.change();
        this._setupLensPicker();

        // model._setupTitlePropertyEditor();
        // var property_list = this.getContent().find("#property_list");
        // this._setupPropertyMultiSelect(property_list, "properties", true);
        // property_list.change();
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
