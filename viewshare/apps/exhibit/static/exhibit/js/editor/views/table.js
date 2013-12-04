define(["jquery",
        "exhibit/js/views/table",
        "scripts/ui/views/tabular-view"],
        function ($, View, TabularView) {
        "use strict"

    View.prototype.label = "Table";
    View.prototype.thumbnail = "/static/exhibit/img/table-icon.png";
    View.prototype.viewClass = TabularView;
    View.prototype.template_name = "table-view-template";

    View.prototype.setupEditor = function (config, template) {
        var view = this;

        this._setupViewForm(config, template);

        this._setupLabelEditor(config, template);

        var props = Freemix.exhibit.database.getAllPropertyObjects();

        var sort = template.find("#sort_property");
        this._setupPropertySelect(config, template, sort, "sortProperty", props, true);

        var sort_order = template.find("#sort_order");
        sort_order.val(config.asc.toString());
        sort_order.change(function (e) {
            config.asc = $(this).val() === 'true';
            template.trigger(view.refreshEvent);
        });


        var property_list = template.find("#property_list");
        this._setupPropertyMultiSelect(config, template, property_list, "properties", true);

        sort.change();
        sort_order.change();
        property_list.change();
    };
    return View;
});