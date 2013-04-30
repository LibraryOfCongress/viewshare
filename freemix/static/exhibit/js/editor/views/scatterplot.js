(function ($, Freemix, Exhibit) {
    "use strict";
    var View = Freemix.view.prototypes["scatterplot"];


    View.prototype.propertyTypes = ["number", "currency"];

    View.prototype.label = "Scatter Plot";
    View.prototype.thumbnail = "/static/exhibit/img/scatterplot-icon.png";

    View.prototype.viewClass = Exhibit.ScatterPlotView;


    // Display the view's UI.
    View.prototype.display = function () {
        var content = this.getContent();
        var root = Freemix.getTemplate("scatterplot-view-template");
        var model = this;
        content.empty();
        root.appendTo(content);

        model._setupViewForm();
        model._setupLabelEditor();

        var numbers = Freemix.exhibit.database.getPropertiesWithTypes(["number"]);

        var xaxis = content.find("#xaxis_property");
        var yaxis = content.find("#yaxis_property");

        model._setupPropertySelect(xaxis, "xaxis", numbers);
        model._setupPropertySelect(yaxis, "yaxis", numbers);
        xaxis.change();
        yaxis.change();

        this._setupLensPicker();

        // model._setupTitlePropertyEditor();
        // var property_list = this.getContent().find("#property_list");
        // this._setupPropertyMultiSelect(property_list, "properties", true);
        // property_list.change();

    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
