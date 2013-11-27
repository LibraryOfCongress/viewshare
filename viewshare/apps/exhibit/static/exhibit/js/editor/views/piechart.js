define(["jquery",
        "exhibit/js/views/piechart",
        "ext/flot/scripts/piechart-view"],
        function ($, View, PiechartView) {
        "use strict"

    View.prototype.label = "Pie Chart";
    View.prototype.thumbnail = "/static/exhibit/img/piechart-icon.png";

    View.prototype.viewClass = PiechartView;
    View.prototype.template_name = "piechart-view-template";

    // Display the view's UI.
    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var property_list = template.find("#property_list");
        this._setupPropertyMultiSelect(config, template, property_list, "properties", true);
        property_list.change();    
    };
    return View;
});