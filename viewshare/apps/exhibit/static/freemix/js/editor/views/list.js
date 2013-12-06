define(["jquery",
        "freemix/js/views/list",
        "scripts/ui/views/tile-view"],
        function ($, View, TileView) {
        "use strict"
    View.prototype.thumbnail = "/static/freemix/img/list-icon.png";
    View.prototype.label = "List";
    View.prototype.viewClass = TileView;
    View.prototype.template_name = "list-view-template";

    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);
        this._setupMultiPropertySortEditor(config, template);
        this._setupLensEditor(config, template);
    };
    return View;
});
