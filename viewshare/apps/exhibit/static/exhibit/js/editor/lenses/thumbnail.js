(function($, Freemix, Exhibit) {
    "use strict";

    var Lens = Freemix.lens.prototypes.thumbnail;

    Lens.propertyTypes = ["image"];
    Lens.label = "Thumbnail";
    Lens.prototype.initializeEditor = function(editor, preview) {
        this._editor = $(editor || "#lens_navigator #lens_detail");
        this._preview = $(preview || "#lens_navigator .lens-preview .lens-preview-pane");
        var root = Freemix.getTemplate("thumbnail-lens-template");
        var content = this.getEditor();
        content.find("#lens_details").empty().append(root);

        var images = Freemix.exhibit.database.getPropertiesWithTypes(["image"]);

        var image = content.find("#image_property");

        // Set up image property selector
        this._setupPropertySelect(image, "image", images);
        this._setupTitlePropertyEditor();
        image.change();
    };
})(window.Freemix.jQuery, window.Freemix, window.Exhibit);