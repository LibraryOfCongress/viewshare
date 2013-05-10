(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["map"];

    View.prototype.propertyTypes = ["location"];

    View.prototype.label = "Map";

    View.prototype.thumbnail = "/static/exhibit/img/map-icon.png";

    View.prototype.viewClass = Exhibit.OLMapView;

    // Display the view's UI.
    View.prototype.display = function () {
        var content = this.getContent();
        var root = Freemix.getTemplate("map-view-template");
        var model = this;
        content.empty();
        root.appendTo(content);
        this._setupViewForm();
        this._setupLabelEditor();

        var db = Freemix.exhibit.database;
        var latlng = content.find("#latlng_property");
        var points = db.getPropertiesWithTypes(["location"]);
        this._setupPropertySelect(latlng, "latlng", points);
        latlng.change();

        var color = content.find("#color_property");
        this._setupPropertySelect(color, "colorKey", Freemix.exhibit.database.getAllPropertyObjects(), true);
        color.change();

        var zoom = content.find("#zoom_level");
        this._setupSelectPropertyHandler(zoom, "zoom");
        zoom.change();

        this._setupLensEditor();
//        this._setupLensPicker();

        // this._setupTitlePropertyEditor();

        // var property_list = this.getContent().find("#property_list");
        // this._setupPropertyMultiSelect(property_list, "properties", true);
        // property_list.change();
    };



})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
