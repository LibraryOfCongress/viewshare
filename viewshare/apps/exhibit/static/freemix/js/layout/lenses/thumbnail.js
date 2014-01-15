define(["jquery", "handlebars", "display/lenses/thumbnail", "text!templates/layout/lenses/thumbnail-lens.html"],
        function ($, Handlebars, Lens, template_html) {
    "use strict";

    Lens.propertyTypes = ["image"];
    Lens.label = "Thumbnail";

    Lens.prototype.template = Handlebars.compile(template_html);
    Lens.prototype.initializeEditor = function(editor, preview) {
        this._editor = $(editor || "#lens_navigator #lens_detail");
        this._preview = $(preview || "#lens_navigator .lens-preview .lens-preview-pane");
        var root = $(this.template);
        var content = this.getEditor();
        content.find("#lens_details").empty().append(root);

        var image = content.find("#image_property");

        // Set up image property selector
        this._setupPropertySelect(image, "image", ["image"]);
        this._setupTitlePropertyEditor();
        image.change();
    };

    return Lens;
});