define(["jquery",
        "freemix/js/widget",
        "freemix/js/freemix",
        "ui.multiselect",
        "freemix/js/exhibit_utilities",
        "layout/patch_exhibit"],
function ($, Widget, Freemix) {
    "use strict";

    function make_option(property_name, selected) {
        var property = Freemix.exhibit.database.getProperty(property_name);
        var option = $("<option></option>");
        option.attr("value", property.getID());
        option.text(property.getLabel());
        if (selected) {
            option.attr("selected", "selected");
        }
        return option;
    }

    Widget.prototype._setupPropertySelect = function(config, template, selector, key, types, nullable, exclude_other_types) {
        this._populatePropertySelect(selector, types, nullable);
        this._setupSelectPropertyHandler(config, template, selector, key);
    };

    function sorter(a,b) {
        if (a.getLabel() < b.getLabel()) return -1;
        if (a.getLabel() > b.getLabel()) return 1;
        return 0;
    }

    Widget.prototype._generatePropertyList = function(types) {
        var filter = [];
        var database = Freemix.exhibit.database;

        var result = {
            order: []
        }
        if ((types ||[]).length == 0) {
            types = this.propertyTypes;
        }

        for (var inx = 0 ; inx < types.length ; inx++) {
            var type = types[inx];
            result[type] = database.getPropertiesWithTypes([type]);
            if (result[type].length > 0) {
                result[type].sort(sorter);
                filter = filter.concat($.map(result[type], function(v,i) {
                    return v.getID();
                }));
                result["order"].push(type);
            }
        }

        var filtered = database.getPropertyObjects(database.getFilteredProperties(filter));
        filtered.sort(sorter);
        result["others"] = filtered;
        return result;
    };

    Widget.prototype._propertyRenderer = function(prop) {
        return prop.getID();
    }

    Widget.prototype._buildOptionGroup = function(label, properties) {
        var optgroup = $("<optgroup>");
        optgroup.attr("label", label);
        for (var inx = 0 ; inx < properties.length ; inx++) {
            var prop = properties[inx];
            var option = $("<option>");
            option.attr("value", this._propertyRenderer(prop));
            option.text(prop.getLabel());
            optgroup.append(option);
        }
        return optgroup;
    }

    Widget.prototype._populatePropertySelect = function(selector, types, nullable) {
        var properties = this._generatePropertyList(types);
        for (var inx = 0 ; inx < properties.order.length ; inx++) {
            var type = properties.order[inx];
            selector.append(this._buildOptionGroup(type + " properties", properties[type]));
        }

        if (properties.others.length > 0) {
            selector.append(this._buildOptionGroup("other properties", properties.others));
        }
        if (nullable) {
            selector.prepend("<option value=''></option>");
        }
    };

    Widget.prototype._setupSelectPropertyHandler = function(config, template, selector, key) {
        var widget = this;
        selector.change(function() {
            var value = $(this).val();
            if (value && value !== ( "" || undefined)) {
                config[key] = value;
            } else {
                config[key] = undefined;
            }
            widget.triggerChange(config, template);


         }).val(config[key]);

        if (!selector.val() && selector.get(0).options.length > 0) {
           selector.get(0).options[0].selected = true;
        }
    };

    Widget.prototype._setupPropertyMultiSelect = function(config, template, selector, key, default_all) {
        var widget = this;
        var value = config[key] || [];
        var inx;

        if (value.length > 0) {
            default_all = false;
        }
        for (inx = 0 ; inx < value.length ; inx++) {
            selector.append(make_option(value[inx], true));
        }

        var properties = Freemix.exhibit.database.getFilteredProperties();
        for (inx = 0 ; inx < properties.length ; inx++) {
            if ($.inArray(properties[inx], value) < 0) {
                selector.append(make_option(properties[inx], default_all));
            }
        }

        selector.parent().on('change', 'select', function() {
            config[key] = $(this).val() || [];
            widget.triggerChange(config, template);
        });
        selector.multiselect({width: 460, height: 250, sortable: true});

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
