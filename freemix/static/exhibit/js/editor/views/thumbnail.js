(function ($, Freemix, Exhibit) {
    "use strict";

    var View = Freemix.view.prototypes["thumbnail"];

    View.prototype.label = "Gallery";
    View.prototype.thumbnail = "/static/exhibit/img/gallery.png";
    View.prototype.propertyTypes = ["image"];

    View.prototype.viewClass = Exhibit.ThumbnailView;


    // Display the view's UI.
    View.prototype.display = function () {
        var content = this.getContent();
        var root = Freemix.getTemplate("thumbnail-view-template");

        content.empty();
        content.append(root);
        this._setupViewForm();
        this._setupLabelEditor();

        var images = Freemix.exhibit.database.getPropertiesWithTypes(["image"]);

        var image = content.find("#image_property");

        // Set up image property selector
        this._setupPropertySelect(image, "image", images);
        this._setupTitlePropertyEditor();
        this._setupMultiPropertySortEditor();

        image.change();
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
