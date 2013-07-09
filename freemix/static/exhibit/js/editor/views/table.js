(function ($, Freemix, Exhibit) {
    "use strict";
    var View = Freemix.view.prototypes["table"];

    View.prototype.label = "Table";
    View.prototype.thumbnail = "/static/exhibit/img/table-icon.png";
    View.prototype.viewClass = Exhibit.TabularView;
    View.prototype.template_name = "table-view-template";

    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);

        this._setupLabelEditor(config, template);

        var props = Freemix.exhibit.database.getAllPropertyObjects();

        var sort = template.find("#sort_property");
        this._setupPropertySelect(config, template, sort, "sortProperty", props, true);

        sort.change();
        var sort_order = template.find("#sort_order");
        sort_order.val(config.asc.toString());
        sort_order.change(function (e) {
            config.asc = $(this).val() === 'true';
        });

        sort_order.change();

        var property_list = template.find("#property_list");
        this._setupPropertyMultiSelect(config, template, property_list, "properties", true);
        property_list.change();
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
