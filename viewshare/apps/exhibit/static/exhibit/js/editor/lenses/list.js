define(["jquery", "exhibit/js/lenses/list"],
        function ($, Lens) {

    "use strict";

    Lens.label = "List";

    Lens.prototype.initializeEditor = function(editor, preview) {
        var config = this.config;
        this._editor = $(editor || "#lens_navigator #lens_detail");
        this._preview = $(preview || "#lens_navigator .lens-preview .lens-preview-pane");
        var root = Freemix.getTemplate("list-lens-template");
        this.getEditor().empty().append(root);

        this._setupTitlePropertyEditor(config);
        var property_list = this.getEditor().find("#property_list");
        this._setupPropertyMultiSelect(config, this._editor, property_list, "properties", true);
        property_list.change();
    };

    return Lens;

})