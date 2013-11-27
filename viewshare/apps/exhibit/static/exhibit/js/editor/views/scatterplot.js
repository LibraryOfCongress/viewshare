define(["jquery",
        "exhibit/js/views/scatterplot",
        "ext/flot/scripts/scatterplot-view"],
        function ($, View, ScatterPlotView) {
        "use strict"

    View.prototype.propertyTypes = ["number", "currency"];

    View.prototype.label = "Scatter Plot";
    View.prototype.thumbnail = "/static/exhibit/img/scatterplot-icon.png";

    View.prototype.viewClass = ScatterPlotView;

    View.prototype.template_name = "scatterplot-view-template";

    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var numbers = Freemix.exhibit.database.getPropertiesWithTypes(["number"]);

        var xaxis = template.find("#xaxis_property");
        var yaxis = template.find("#yaxis_property");

        this._setupPropertySelect(config, template, xaxis, "xaxis", numbers);
        this._setupPropertySelect(config, template, yaxis, "yaxis", numbers);
        xaxis.change();
        yaxis.change();

        this._setupLensEditor(config, template);

    };

    return View;
});