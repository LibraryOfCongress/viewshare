(function($, Freemix, Exhibit) {
    "use strict";

    var Lens = Freemix.lens.prototypes.list;

    Lens.label = "List";

    Lens.prototype.initializeEditor = function() {
        var root = Freemix.getTemplate("list-lens-template");
        this.getContent().find("#lens_details").empty().append(root);

        this._setupTitlePropertyEditor();
        var property_list = this.getContent().find("#property_list");
        this._setupPropertyMultiSelect(property_list, "properties", true);
        property_list.change();
    };


})(window.Freemix.jQuery, window.Freemix, window.Exhibit);