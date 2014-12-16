define(["jquery",
        "display/views/barchart",
        "ext/flot/scripts/barchart-view",
        "handlebars",
        "text!templates/layout/views/barchart-view.html"],
        function ($, View, BarChartView, Handlebars, template_html) {
        "use strict"

    View.prototype.label = "Bar Chart";
    View.prototype.icon_class = "fa fa-bar-chart-o fa-3x";

    View.prototype.exhibitClass = BarChartView;
    View.prototype.template = Handlebars.compile(template_html);

    // Display the view's UI.
    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);
        var props = Freemix.exhibit.database.getPropertyObjects();

        var property_list = template.find("#property_list");
        //this._setupPropertyMultiSelect(config, template, property_list, "properties", true);
        this._setupPropertySelect(config, template, property_list, "grouping", [])
        property_list.change();

        this._setupLensEditor(config, template);

    };
    return View;
});
