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

        this.components = [];

        this.Observer = new Observer().Observer;
    };

    CompositePropertyView.prototype.template = Handlebars.compile(settings_template);


    CompositePropertyView.prototype.render = function() {
        this.renderSettings();

        this.model.Observer.subscribe("createPropertySuccess",
            this.createPropertySuccessHandler.bind(this));
        this.model.Observer.subscribe("createPropertyFailure",
            this.createPropertyFailureHandler.bind(this));
        this.model.Observer.subscribe("augmentDataSuccess",
            this.augmentDataSuccessHandler.bind(this));
        this.model.Observer.subscribe("augmentDataFailure",
            this.augmentDataFailureHandler.bind(this));
        this.model.Observer.subscribe("loadDataSuccess",
            this.loadDataSuccessHandler.bind(this));
    };

    CompositePropertyView.prototype.renderSettings = function() {
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

    CompositePropertyView.prototype.renderProgress = function() {

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

    CompositePropertyView.prototype.findCancelButton = function() {
        return this.element.find("#location_augment_cancel_button");
    }

    CompositePropertyView.prototype.findSaveButton = function() {
        return this.element.find("#location_augment_save_button");
    }

    CompositePropertyView.prototype.cancelButtonHandler = function() {
        this.Observer("cancel").publish();
    };

    CompositePropertyView.prototype.saveButtonHandler = function() {
        this.model.createProperty();
    };

    CompositePropertyView.prototype.destroySettings = function() {
        for (var inx = 0 ; inx < this.components.length ; inx++) {
            this.components[inx].destroy();
        }
        this.components = [];

        this.findCancelButton().off("click", this.cancelButtonHandler.bind(this));
        this.findCancelButton().off("click", this.saveButtonHandler.bind(this));
        this.element.empty();
    }



    CompositePropertyView.prototype.destroy = function() {

        this.model.Observer.unsubscribe("createPropertySuccess",
            this.createPropertySuccessHandler.bind(this));
        this.model.Observer.unsubscribe("createPropertyFailure",
            this.createPropertyFailureHandler.bind(this));
        this.model.Observer.unsubscribe("augmentDataSuccess",
            this.augmentDataSuccessHandler.bind(this));
        this.model.Observer.unsubscribe("augmentDataFailure",
            this.augmentDataFailureHandler.bind(this));

        this.destroySettings();
    };

    return CompositePropertyView;
});

