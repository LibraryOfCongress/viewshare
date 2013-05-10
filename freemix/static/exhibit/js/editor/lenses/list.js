(function($, Freemix, Exhibit) {
    "use strict";

    var Lens = Freemix.lens.prototypes.list;

    Lens.label = "List";

    Lens.prototype.initializeEditor = function(editor, preview) {
        this._editor = $(editor || "#lens_navigator #lens_detail");
        this._preview = $(preview || "#lens_navigator .lens-preview .lens-preview-pane");
        var root = Freemix.getTemplate("list-lens-template");
        this.getEditor().empty().append(root);

        this._setupTitlePropertyEditor();
        var property_list = this.getEditor().find("#property_list");
        this._setupPropertyMultiSelect(property_list, "properties", true);
        property_list.change();
    };


})(window.Freemix.jQuery, window.Freemix, window.Exhibit);