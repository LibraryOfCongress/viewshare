(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["list"];
    View.prototype.thumbnail = "/static/exhibit/img/list-icon.png";
    View.prototype.label = "List";
    View.prototype.viewClass = Exhibit.TileView;
    // Display the view's UI.
    View.prototype.display = function () {
        var content = this.getContent();
        var root = Freemix.getTemplate("list-view-template");
        content.empty();
        root.appendTo(content);
        this._setupViewForm();
        this._setupLabelEditor();
        this._setupMultiPropertySortEditor();
        this._setupLensEditor();
//        this._setupLensPicker();
        // this._setupTitlePropertyEditor();

        // var property_list = this.getContent().find("#property_list");
        // this._setupPropertyMultiSelect(property_list, "properties", true);
        // property_list.change();
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
