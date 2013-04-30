(function ($, Freemix, Exhibit) {
    "use strict";
    var View = Freemix.view.prototypes["table"];

    View.prototype.label = "Table";
    View.prototype.thumbnail = "/static/exhibit/img/table-icon.png";
    View.prototype.viewClass = Exhibit.TabularView;

    // Display the view's UI.
    View.prototype.display = function () {
        var model = this;
        var content = this.getContent();
        var root = Freemix.getTemplate("table-view-template");
        content.empty();
        root.appendTo(content);
        this._setupViewForm();

        this._setupLabelEditor();

        var props = Freemix.exhibit.database.getAllPropertyObjects();

        var sort = content.find("#sort_property");
        model._setupPropertySelect(sort, "sortProperty", props, true);

        sort.change();
        var sort_order = content.find("#sort_order");
        sort_order.val(model.config.asc.toString());
        sort_order.change(function (e) {
            model.config.asc = $(this).val() === 'true';
        });

        sort_order.change();

        var property_list = this.getContent().find("#property_list");
        this._setupPropertyMultiSelect(property_list, "properties", true);
        property_list.change();
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
