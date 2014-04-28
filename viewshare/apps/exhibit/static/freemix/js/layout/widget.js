define(["jquery",
        "freemix/js/widget",
        "freemix/js/freemix",
        "multiselect",
        "freemix/js/exhibit_utilities",
        "layout/patch_exhibit"],
function ($, Widget, Freemix, Multiselect) {
    "use strict";

    function make_option(property_name) {
        return Freemix.exhibit.database.getProperty(property_name);
    }

    Widget.prototype._setupPropertySelect = function(config, template, selector, key, types, nullable, exclude_other_types) {
        // do nothing, not pertinent
    };

    Widget.prototype._setupPropertyMultiSelect = function(config, template, selector, key, default_all) {
        this._multiselect = null;
        var widget = this;
        var value = config[key] || [];
        var selected = [];
        var deselected = [];
        var inx, default_all;

        if (value.length > 0) {
            default_all = false;
        }
        for (inx = 0 ; inx < value.length ; inx++) {
            selected.push(make_option(value[inx]));
        }

        var properties = Freemix.exhibit.database.getFilteredProperties();
        for (inx = 0 ; inx < properties.length ; inx++) {
            if ($.inArray(properties[inx], value) < 0) {
                if (default_all) {
                    selected.push(make_option(properties[inx]));
                } else {
                    deselected.push(make_option(properties[inx]));
                }
            }
        }

        this._multiselect = new Multiselect(selector, selected, deselected);
        selector.on('modify.multiselect', function(evt, data) {
            config[key] = data || [];
            widget.triggerChange(config, template);
        });
    };

    Widget.prototype.findWidget = function() {
        if (!this._selector) {
            this._selector = this.generateWidget();
        }
        return this._selector;
    };

    Widget.prototype.serialize = function() {
        return $.extend(true, {}, this.config);
    };

    Widget.prototype.generateWidget = function() {
        return $("<div>");
    };

    Widget.prototype.remove = function() {
        this._multiselect.container.off('modify.multiselect');
        this._multiselect.destroy();
        this._multiselect = null;
        this.findWidget().remove();
    };

    Widget.prototype.triggerChange = function(config, template) {
        if (this.isValid(config)) {
            template.find("#widget_save_button").removeAttr("disabled").removeClass("disabled");

        } else {
            template.find("#widget_save_button").attr("disabled", "disabled").addClass("disabled");
        }
        template.trigger(this.refreshEvent);
    }

    Widget.prototype.isValid = function() {
        return true;
    }

    Widget.prototype.propertyTypes = ["text", "image", "currency", "url", "location", "date", "number"];

});
