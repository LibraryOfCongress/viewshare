define(["jquery",
        "display/views/scatterplot",
        "ext/flot/scripts/scatterplot-view",
        "handlebars",
        "text!templates/layout/views/scatterplot-view.html"],
        function ($, View, ScatterPlotView, Handlebars, template_html) {
        "use strict"

    View.prototype.propertyTypes = ["number", "currency"];

    View.prototype.label = "Scatter Plot";
    View.prototype.icon_class = "fa fa-building-o fa-rotate-90 fa-3x";

    View.prototype.viewClass = ScatterPlotView;

    View.prototype.template = Handlebars.compile(template_html);

    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var xaxis = template.find("#xaxis_property");
        var yaxis = template.find("#yaxis_property");

        this._setupPropertySelect(config, template, xaxis, "xaxis", ["number"]);
        this._setupPropertySelect(config, template, yaxis, "yaxis", ["number"]);
        xaxis.change();
        yaxis.change();

        this._setupLensEditor(config, template);

    };

    return View;
});