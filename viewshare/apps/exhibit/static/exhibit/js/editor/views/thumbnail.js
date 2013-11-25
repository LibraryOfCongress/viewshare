define(["jquery",
        "exhibit/js/views/thumbnail",
        "exhibit"],
        function ($, View, Exhibit) {
        "use strict"

    View.prototype.label = "Gallery";
    View.prototype.thumbnail = "/static/exhibit/img/gallery.png";
    View.prototype.propertyTypes = ["image"];

    View.prototype.viewClass = Exhibit.ThumbnailView;
    View.prototype.template_name = "thumbnail-view-template";

    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var images = Freemix.exhibit.database.getPropertiesWithTypes(["image"]);

        var image = template.find("#image_property");

        // Set up image property selector
        this._setupPropertySelect(config, template, image, "image", images);
        this._setupTitlePropertyEditor(config, template);
        this._setupMultiPropertySortEditor(config, template);

        image.change();
    };

    return View;
});