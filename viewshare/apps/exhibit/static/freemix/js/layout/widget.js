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
        this._populatePropertySelect(selector, types, nullable, exclude_other_types);
        this._setupSelectPropertyHandler(config, template, selector, key);
    };

    Widget.prototype._populatePropertySelect = function(selector, types, nullable, exclude_other_types) {
        var optgroup;
        var filter = [];
        var db = Freemix.exhibit.database;

        if (types.length > 0) {
            for (var inx = 0 ; inx < types.length ; inx++) {
                var type = types[inx];
                var collection = db.getPropertiesWithTypes([type]);
                optgroup = $("<optgroup>");
                optgroup.attr("label", type);

                if (collection.length > 0) {

                    $.each(collection, function(inx, value) {
                        var option = $("<option></option>");
                        option.attr("value", value.getID());
                        option.text(value.getLabel());
                        optgroup.append(option);
                        filter.push(value.getID());
                    });
                }

                selector.append(optgroup);
            }

            if (!exclude_other_types) {
                var filtered = db.getPropertyObjects(db.getFilteredProperties(filter));
                if (filtered.length > 0) {
                    optgroup = $("<optgroup>");
                    optgroup.attr("label", "others");
                    $.each(filtered, function(inx, value) {
                        var option = $("<option></option>");
                        option.attr("value", value.getID());
                        option.text(value.getLabel());
                        optgroup.append(option);
                        filter.push(value.getID());
                    });
                    selector.append(optgroup);
                }
            }
        } else {
            var collection = db.getPropertyObjects();
            $.each(collection, function(inx, value) {
                var option = $("<option></option>");
                option.attr("value", value.getID());
                option.text(value.getLabel());
                selector.append(option);
            });
        }


        if (nullable) {
            selector.prepend("<option value=''></option>");
        }
    };

    Widget.prototype._setupSelectPropertyHandler = function(config, template, selector, key) {
        var view = this;
        selector.change(function() {
            var value = $(this).val();
            if (value && value !== ( "" || undefined)) {
                config[key] = value;
            } else {
                config[key] = undefined;
            }
            template.trigger(view.refreshEvent);
         }).val(config[key]);

        if (!selector.val() && selector.get(0).options.length > 0) {
           selector.get(0).options[0].selected = true;
        }
    };

    Widget.prototype._setupPropertyMultiSelect = function(config, template, selector, key, default_all) {
        var view = this;
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
            template.trigger(view.refreshEvent);

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

    Widget.prototype.propertyTypes = ["text", "image", "currency", "url", "location", "date", "number"];

});
