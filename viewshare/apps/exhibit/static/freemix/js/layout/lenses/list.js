define(["jquery", "handlebars", "display/lenses/list",
        "text!templates/layout/lenses/list-lens.html"],
        function ($, Handlebars, Lens, template_html) {

    "use strict";

    Lens.label = "List";

    Lens.prototype.template = Handlebars.compile(template_html);

    Lens.prototype.initializeEditor = function(editor, preview) {
        var config = this.config;
        this._editor = $(editor || "#lens_navigator #lens_detail");
        this._preview = $(preview || "#lens_navigator .lens-preview .lens-preview-pane");
        var root = $(this.template());
        this.getEditor().empty().append(root);

        this._setupTitlePropertyEditor(config);
        var property_list = this.getEditor().find("#property_list");
        this._setupPropertyMultiSelect(config, this._editor, property_list, "properties", true);
        property_list.change();
    };

    return Lens;

});