define(["jquery", "display/lenses/base"],
    function ($, BaseLens) {
    "use strict";

    BaseLens.prototype.refreshEvent = "refresh-preview.lens";

    BaseLens.prototype.initializeEditor = function(editor, preview) {
        this._editor = $(editor || "#lens_navigator #lens_detail");
        this._preview = $(preview || "#lens_navigator .lens-preview .lens-preview-pane");
        this._editor.empty().append("initializing " + this.config.name);
    };

    BaseLens.prototype.getEditor = function() {
        return this._editor;
    };

    BaseLens.prototype.getContent = function() {
        return this.getEditor();
    };

    BaseLens.prototype.getPreview = function() {
        return this._preview;
    };

    BaseLens.prototype._setupTitlePropertyEditor = function(config) {
        config = config||this.config;
        var content = this.getEditor();
        var title = content.find("#title_property");
        var title_link = content.find("#title_link_property");

        this._setupPropertySelect(config, content, title, "title", [], true);
        title.change(function() {
             if (title.val() && title_link.get(0).options.length > 0) {
                 title_link.removeAttr("disabled");
             } else {
                 title_link.attr("disabled", true);
                 title_link.val("");
                 title_link.change();
             }
        });

        this._setupPropertySelect(config, content, title_link, "titleLink", ["image", "url"], true);
        if (title_link.get(0).options.length == 0) {
            title_link.attr("disabled", true);
        }
        title.change();
        title_link.change();

    };

    return BaseLens;
});