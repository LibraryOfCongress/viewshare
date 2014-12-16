define([
    "jquery",
    "handlebars",
    "layout/models/composite-property",
    "./property-multiselect-component",
    "bootstrap"],
function(
    $,
    Handlebars,
    CompositePropertyModel,
    PropertyMultiselect
) {
    "use strict";

    /**
     * Composite property settings editor
     *
     * @param options
     * @constructor
     */
    function SettingsView(options) {
        this.initialize.apply(this, [options]);
    }

    SettingsView.prototype.initialize = function(options) {
        this.element = options.element;
        this.database = options.database;
        this.model = options.model;
        this.Observer = options.observer;
        this.components = [];
    };

    SettingsView.prototype.template = function() {return "NOT IMPLEMENTED"};

    SettingsView.prototype.property_label = "NOT IMPLEMENTED";

    SettingsView.prototype.constructPropertyName = function() {
        var counter = 1;
        var label = this.property_label;
        var database = this.database;
        var property_names = $.map(database.getAllProperties(), function(p) {
            return database.getProperty(p).getLabel();
        });
        while (property_names.indexOf(label) >= 0) {
            label = this.property_label + " " + (++counter);
        }
        return label;
    };

    SettingsView.prototype.render = function() {
        var model = this.model;

        this.element.append(this.template());

        var multiselect = new PropertyMultiselect({
            element: this.element.find("#augment_property_list"),
            database: this.database,
            value: []
        });
        multiselect.render();
        var label = this.constructPropertyName();
        multiselect.addChangeHandler(function(val) {
            model.composite = val;
            model.label = label;
        });
        this.components.push(multiselect);
        this.findSaveButton().click(this.saveButtonHandler.bind(this));

        this.findCancelButton().click(this.cancelButtonHandler.bind(this));

    };

    SettingsView.prototype.destroy = function() {
        for (var inx = 0 ; inx < this.components.length ; inx++) {
            this.components[inx].destroy();
        }
        this.components = [];

        this.findCancelButton().off("click", this.cancelButtonHandler.bind(this));
        this.findCancelButton().off("click", this.saveButtonHandler.bind(this));
        this.element.empty();
    };

    SettingsView.prototype.findCancelButton = function() {
        return this.element.find("#property_create_cancel_button");
    };

    SettingsView.prototype.findSaveButton = function() {
        return this.element.find("#property_create_button");
    };

    SettingsView.prototype.cancelButtonHandler = function() {
        this.Observer("cancel").publish();
    };

    SettingsView.prototype.saveButtonHandler = function() {
        this.model.createProperty();
    };

    return SettingsView;
});

