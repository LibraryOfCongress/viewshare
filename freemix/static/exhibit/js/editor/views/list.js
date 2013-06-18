(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["list"];
    View.prototype.thumbnail = "/static/exhibit/img/list-icon.png";
    View.prototype.label = "List";
    View.prototype.viewClass = Exhibit.TileView;
    View.prototype.template_name = "list-view-template";

    View.prototype.setupEditor = function(config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);
        this._setupMultiPropertySortEditor(config, template);
        this._setupLensEditor(config, template);

    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
