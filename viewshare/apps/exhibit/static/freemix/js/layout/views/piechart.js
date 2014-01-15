define(["jquery",
        "display/views/piechart",
        "ext/flot/scripts/piechart-view",
        "handlebars",
        "text!templates/layout/views/piechart-view.html"],
        function ($, View, PiechartView, Handlebars, template_html) {
        "use strict"

    View.prototype.label = "Pie Chart";
    View.prototype.icon_class = "fa fa-adjust fa-3x";

    View.prototype.viewClass = PiechartView;
    View.prototype.template = Handlebars.compile(template_html);

    // Display the view's UI.
    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var property_list = template.find("#property_list");
        //this._setupPropertyMultiSelect(config, template, property_list, "properties", true);
        this._setupPropertySelect(config, template, property_list, "grouping", [])
        property_list.change();

        this._setupLensEditor(config, template);

    };
    return View;
});