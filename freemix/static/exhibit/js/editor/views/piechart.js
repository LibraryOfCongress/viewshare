(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["piechart"];

    View.prototype.label = "Pie Chart";
    View.prototype.thumbnail = "/static/exhibit/img/piechart-icon.png";

    View.prototype.viewClass = Exhibit.PiechartView;

    // Display the view's UI.
    View.prototype.display = function () {
        var content = this.getContent();
        var root = Freemix.getTemplate("piechart-view-template");
        content.empty();
        root.appendTo(content);
        this._setupViewForm();
        this._setupLabelEditor();

        var property_list = this.getContent().find("#property_list");
        this._setupPropertyMultiSelect(property_list, "properties", true);
        property_list.change();    
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
