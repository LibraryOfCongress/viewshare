define(["jquery",
        "display/views/thumbnail",
        "scripts/ui/views/thumbnail-view"],
        function ($, View, ThumbnailView) {
        "use strict"

    View.prototype.label = "Gallery";
    View.prototype.thumbnail = "/static/freemix/img/gallery.png";
    View.prototype.propertyTypes = ["image"];
    View.prototype.icon_class = "fa fa-camera-retro fa-3x";

    View.prototype.viewClass = ThumbnailView;
    View.prototype.template_name = "thumbnail-view-template";

    View.prototype._setupTitlePropertyEditor = function(config, template) {
        config = config||this.config;

        var title = template.find("#title_property");
        var title_link = template.find("#title_link_property");

        this._setupPropertySelect(config, template, title, "title", [], true);
        title.change(function() {
             if (title.val() && title_link.get(0).options.length > 0) {
                 title_link.removeAttr("disabled");
             } else {
                 title_link.attr("disabled", true);
                 title_link.val("");
                 title_link.change();
             }
        });

        this._setupPropertySelect(config, template, title_link, "titleLink", ["image", "url"], true);
        if (title_link.get(0).options.length == 0) {
            title_link.attr("disabled", true);
        }
        title.change();
        title_link.change();

    };


    View.prototype.setupEditor = function (config, template) {

        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var image = template.find("#image_property");

        // Set up image property selector
        this._setupPropertySelect(config, template, image, "image", ["image"]);
        this._setupTitlePropertyEditor(config, template);
        this._setupMultiPropertySortEditor(config, template);

        image.change();
    };

    return View;
});