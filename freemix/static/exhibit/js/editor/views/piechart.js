(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["piechart"];

    View.prototype.label = "Pie Chart";
    View.prototype.thumbnail = "/static/exhibit/img/piechart-icon.png";

    View.prototype.viewClass = Exhibit.PiechartView;
    View.prototype.template_name = "piechart-view-template";

    // Display the view's UI.
    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var property_list = template.find("#property_list");
        this._setupPropertyMultiSelect(config, template, property_list, "properties", true);
        property_list.change();    
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
