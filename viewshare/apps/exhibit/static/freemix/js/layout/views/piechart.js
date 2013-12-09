define(["jquery",
        "display/views/piechart",
        "ext/flot/scripts/piechart-view"],
        function ($, View, PiechartView) {
        "use strict"

    View.prototype.label = "Pie Chart";
    View.prototype.thumbnail = "/static/freemix/img/piechart-icon.png";
    View.prototype.icon_class = "fa fa-adjust fa-3x";

    View.prototype.viewClass = PiechartView;
    View.prototype.template_name = "piechart-view-template";

    // Display the view's UI.
    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);
        var props = Freemix.exhibit.database.getAllPropertyObjects();

        var property_list = template.find("#property_list");
        //this._setupPropertyMultiSelect(config, template, property_list, "properties", true);
        this._setupPropertySelect(config, template, property_list, "grouping", props)
        property_list.change();

        this._setupLensEditor(config, template);

    };
    return View;
});