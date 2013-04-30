(function($, Freemix, Exhibit) {
    "use strict";

    var BaseLens = Freemix.lens.BaseLens;

    BaseLens.prototype.refreshEvent = "refresh-preview.lens";

    BaseLens.prototype.initializeEditor = function() {
        this.getContent().find("#lens_details").empty().append("initializing" + this.config.name);
    };

    BaseLens.prototype.getContent = function() {
        return $("#lens_navigator");
    };

    BaseLens.prototype._setupTitlePropertyEditor = function(config) {
        config = config||this.config;
        var links = Freemix.exhibit.database.getPropertiesWithTypes(["image", "url"]);
        var titles = Freemix.exhibit.database.getAllPropertyObjects();
        var content = this.getContent();
        var title = content.find("#title_property");
        var title_link = content.find("#title_link_property");

        this._setupPropertySelect(title, "title", titles, true);
        title.change(function() {
             if (title.val() && links.length > 0) {
                 title_link.removeAttr("disabled");
             } else {
                 title_link.attr("disabled", true);
                 title_link.val("");
                 title_link.change();
             }
        });

        if (links.length > 0) {
             this._setupPropertySelect(title_link, "titleLink", links, true);
        } else {
             title_link.attr("disabled", true);
        }
        title.change();
        title_link.change();

    };

    BaseLens.prototype.refreshPreview = function() {
        var well = this.getContent().find(".lens-preview .lens-preview-pane");

        well.empty();
        $("<div ex:role='view'></div>").append(this.generateExhibitHTML()).appendTo(well);

        var exhibit = Freemix.getBuilderExhibit();
        Exhibit.TileView.createFromDOM(well.find("div").get(0), null, exhibit.getUIContext());
    };

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);