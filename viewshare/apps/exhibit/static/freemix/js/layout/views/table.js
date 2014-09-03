define(["jquery",
        "display/views/table",
        "scripts/ui/views/tabular-view",
        "handlebars",
        "text!templates/layout/views/table-view.html"],
        function ($, View, TabularView, Handlebars, template_html) {
        "use strict"

    View.prototype.label = "Table";
    View.prototype.exhibitClass = TabularView;
    View.prototype.template = Handlebars.compile(template_html);
    View.prototype.icon_class = "fa fa-table fa-3x";

    View.prototype.validate = function(config) {
        this.errors = [];

        if (config.properties.length == 0) {
            this.errors.push("Please select properties to display");
        }

        return this.errors == 0;
    };

    View.prototype.setupEditor = function (config, template) {
        var view = this;

        this._setupViewForm(config, template);

        this._setupLabelEditor(config, template);

        var sort = template.find("#sort_property");
        this._setupPropertySelect(config, template, sort, "sortProperty", [], true);

        var sort_order = template.find("#sort_order");
        sort_order.val(config.asc.toString());
        sort_order.change(function (e) {
            config.asc = $(this).val() === 'ascending';
            view.triggerChange(config, template);
        });


        var property_list = template.find("#property_list");
        this._setupPropertyMultiSelect(config, template, property_list, "properties", true);

        this._multiselect.onChange(null, null);

        sort.change();
        sort_order.change();
    };
    return View;
});
