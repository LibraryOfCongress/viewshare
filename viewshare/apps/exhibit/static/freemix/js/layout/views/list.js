define(["jquery",
        "display/views/list",
        "scripts/ui/views/tile-view",
        "handlebars",
        "text!templates/layout/views/list-view.html"],
        function ($, View, TileView, Handlebars, template_html) {
        "use strict"
    View.prototype.icon_class = "fa fa-list fa-3x";
    View.prototype.label = "List";
    View.prototype.viewClass = TileView;
    View.prototype.template = Handlebars.compile(template_html);

    View.prototype.setupEditor = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);
        this._setupMultiPropertySortEditor(config, template);
        this._setupLensEditor(config, template);
    };
    return View;
});
