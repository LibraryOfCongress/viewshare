define(["jquery",
        "freemix/js/widget",
        "ui.multiselect"],
    function ($, Widget) {
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

    Widget.prototype._setupPropertySelect = function(config, template, selector, key, collection, nullable) {
        this._populatePropertySelect(selector, collection, nullable);
        this._setupSelectPropertyHandler(config, template, selector, key);
    };

    Widget.prototype._populatePropertySelect = function(selector, collection, nullable) {
        $.each(collection, function(inx, value) {
            var option = $("<option></option>");
            option.attr("value", value.getID());
            option.text(value.getLabel());
            selector.append(option);
        });

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

        if (!selector.val()) {
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

    Widget.prototype.isAvailable = function() {
        return Freemix.exhibit.database.getPropertiesWithTypes(this.propertyTypes).length > 0;
    };

});