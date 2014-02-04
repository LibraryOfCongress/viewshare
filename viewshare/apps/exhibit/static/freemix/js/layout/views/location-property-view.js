define(["jquery",
        "handlebars",
        "text!templates/layout/views/location-property.html",
        "models/composite-property",
        "layout/views/property-multiselect-component",
        "observer",
        "bootstrap",
        "jquery.uuid"],
function($,
         Handlebars,
         settings_template,
         CompositePropertyModel,
         PropertyMultiselect,
         Observer
) {
    "use strict";


    function SettingsView(options) {
        this.element = options.element;
        this.database = options.database;
        this.model = options.model;
        this.Observer = options.observer;

        this.components = [];

    }

    SettingsView.prototype.template = Handlebars.compile(settings_template);

    SettingsView.prototype.render = function() {
        var model = this.model;

        this.element.append(this.template());

        var multiselect = new PropertyMultiselect({
            element: this.element.find("#augment_property_list"),
            database: this.database,
            value: []
        });
        multiselect.render();
        multiselect.addChangeHandler(function(val) {
            model.composite = val;
            model.label = "Coordinates";
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
    }

    SettingsView.prototype.findCancelButton = function() {
        return this.element.find("#location_augment_cancel_button");
    }

    SettingsView.prototype.findSaveButton = function() {
        return this.element.find("#location_augment_save_button");
    }

    SettingsView.prototype.cancelButtonHandler = function() {
        this.Observer("cancel").publish();
    };

    SettingsView.prototype.saveButtonHandler = function() {
        this.model.createProperty();
    };


    function CompositePropertyView(options) {
        this.element = options.element;
        this.database = options.database;
        this.model = new CompositePropertyModel({
            id: undefined,
            label: undefined,
            type: 'location',
            value: [],
            augmentation: 'composite',
            composite: [],
            property_url: "properties/"
        });

        this.Observer = new Observer().Observer;

        this.component = new SettingsView({
            element: this.element,
            database: this.database,
            model: this.model,
            observer: this.Observer
        });
    };



    CompositePropertyView.prototype.render = function() {
        this.component.render();

        this.model.Observer("createPropertySuccess").subscribe(
            this.createPropertySuccessHandler.bind(this));
        this.model.Observer("createPropertyFailure").subscribe(
            this.createPropertyFailureHandler.bind(this));
        this.model.Observer("augmentDataSuccess").subscribe(
            this.augmentDataSuccessHandler.bind(this));
        this.model.Observer("augmentDataFailure").subscribe(
            this.augmentDataFailureHandler.bind(this));
        this.model.Observer("loadDataSuccess").subscribe(
            this.loadDataSuccessHandler.bind(this));
    };

    CompositePropertyView.prototype.createPropertySuccessHandler = function() {

    };

    CompositePropertyView.prototype.createPropertyFailureHandler = function(status) {

    };

    CompositePropertyView.prototype.augmentDataSuccessHandler = function(property) {

    };

    CompositePropertyView.prototype.loadDataSuccessHandler = function(property) {
        this.database.loadData({"items": property.items, "properties": property.toJSON()});

    };

    CompositePropertyView.prototype.augmentDataFailureHandler = function(property) {

    };

    CompositePropertyView.prototype.destroy = function() {

        this.model.Observer("createPropertySuccess").unsubscribe(
            this.createPropertySuccessHandler.bind(this));
        this.model.Observer("createPropertyFailure").unsubscribe(
            this.createPropertyFailureHandler.bind(this));
        this.model.Observer("augmentDataSuccess").unsubscribe(
            this.augmentDataSuccessHandler.bind(this));
        this.model.Observer("augmentDataFailure").unsubscribe(
            this.augmentDataFailureHandler.bind(this));

        this.component.destroy();
    };

    return CompositePropertyView;
});

