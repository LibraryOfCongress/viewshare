define(["jquery",
        "freemix/js/freemix",
        "multiselect",
        "bootstrap"],
function($, Freemix, Multiselect) {
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
        var selected = [];
        var deselected = [];

        for (inx = 0 ; inx < this.value.length ; inx++) {
            selected.push(this.renderOption(this.value[inx]));
        }

        var properties = this.database.getFilteredProperties();
        for (inx = 0 ; inx < properties.length ; inx++) {
            if ($.inArray(properties[inx], this.value) < 0) {
                if (this.select_all) {
                    selected.push(this.renderOption(properties[inx]));
                } else {
                    deselected.push(this.renderOption(properties[inx]));
                }
            }
        }
        var view = this;
        this._multiselect = new Multiselect(selector, selected, deselected, {"maxListHeight": 240});
        selector.on('modify.multiselect', function(evt, data) {
            view.value = data || [];
            view.changeHandler();
        });
    }

    View.prototype.changeHandler = function() {
        for (var inx = 0 ; inx < this.listeners.length ; inx++) {
            this.listeners[inx](this.value);
        }
    }

    View.prototype.renderOption = function (property_name) {
        return this.database.getProperty(property_name);
    }


    View.prototype.destroy = function() {
        this.element.off('modify.multiselect');
        this._multiselect.destroy();
        this._multiselect = null;
    }

    return View;
});
