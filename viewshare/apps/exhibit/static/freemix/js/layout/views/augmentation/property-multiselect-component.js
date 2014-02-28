define(["jquery",
        "freemix/js/freemix",
        "ui.multiselect",
        "bootstrap"],
function($, Freemix) {
    "use strict";

    function View(options) {
        this.element = options.element;
        this.database = options.database;
        this.listeners = [];

        this.value = options.value || [];
        this.select_all = (options.select_all && this.value.length == 0)

    }

    View.prototype.getValue = function() {
        return this.value;
    }

    View.prototype.addChangeHandler = function(fn) {
        this.listeners.push(fn);
    }

    View.prototype.render = function() {
        var inx;
        var selector = this.element;
        for (inx = 0 ; inx < this.value.length ; inx++) {
            selector.append(this.renderOption(this.value[inx], true));
        }

        var properties = this.database.getFilteredProperties();
        for (inx = 0 ; inx < properties.length ; inx++) {
            if ($.inArray(properties[inx], this.value) < 0) {
                selector.append(this.renderOption(properties[inx], this.select_all));
            }
        }
        var view = this;
        selector.parent().on('change', 'select', this.changeHandler.bind(this));
        selector.multiselect({width: 460, height: 250, sortable: true});
    }

    View.prototype.changeHandler = function() {
        this.value = this.element.val() || [];
        for (var inx = 0 ; inx < this.listeners.length ; inx++) {
            this.listeners[inx](this.value);
        }
    }

    View.prototype.renderOption = function (property_name, selected) {
        var property = this.database.getProperty(property_name);
        var option = $("<option></option>");
        option.attr("value", property.getID());
        option.text(property.getLabel());
        if (selected) {
            option.attr("selected", "selected");
        }
        return option;
    }


    View.prototype.destroy = function() {
        this.element.parent().off('change', 'select');
        this.element.multiselect('destroy');
    }

    return View;
});