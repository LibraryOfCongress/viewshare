define([
    "jquery",
    "handlebars",
    "layout/models/composite-property",
    "layout/views/property-multiselect-component",
    "observer",
    "text!templates/layout/views/location-property.html",
    "text!templates/layout/views/augment-progress.html",
    "text!templates/layout/views/augment-error.html",
    "text!templates/layout/views/augment-success.html",
    "bootstrap",
    "jquery.uuid"],
function(
    $,
    Handlebars,
    CompositePropertyModel,
    PropertyMultiselect,
    Observer,
    settings_template,
    progress_template,
    error_template,
    success_template
) {
    "use strict";

    /**
     * Composite property settings editor
     *
     * @param options
     * @constructor
     */
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
        return this.element.find("#property_create_cancel_button");
    }

    SettingsView.prototype.findSaveButton = function() {
        return this.element.find("#property_create_button");
    }

    SettingsView.prototype.cancelButtonHandler = function() {
        this.Observer("cancel").publish();
    };

    SettingsView.prototype.saveButtonHandler = function() {
        this.model.createProperty();
    };


    /**
     * Displays a progress bar
     * @param options
     * @constructor
     */
    function ProgressView(options) {
        this.element = options.element;
        this.model = options.model;
        this.Observer = options.observer;
    }

    ProgressView.prototype.template = Handlebars.compile(progress_template);

    ProgressView.prototype.render = function() {
        this.element.empty();
        this.element.append(this.template());
    };

    ProgressView.prototype.destroy = function() {

    };


    /**
     * Display augmentation errors
     * @param options
     * @constructor
     */
    function ErrorView(options) {
        this.element = options.element;
        this.model = options.model;
        this.Observer = options.observer;
        this.delete_property = options.delete_property || false;
        this.message = options.message
    };

    ErrorView.prototype.template = Handlebars.compile(error_template);

    ErrorView.prototype.render = function() {
        this.element.empty();
        this.element.append(this.template({message: this.message}));

        if (this.delete_property) {
            this.model.deleteProperty();
        }
    };

    ErrorView.prototype.destroy = function()  {

    };


    /**
     * Display on augmentation success.  Provides options for accepting
     * or deleting the new property.
     * @param options
     * @constructor
     */
    function SuccessView(options) {
        this.element = options.element;
        this.model = options.model;
        this.Observer = options.observer;
        this.database = options.database;
    }

    SuccessView.prototype.template = Handlebars.compile(success_template);

    SuccessView.prototype.render = function() {
        this.element.empty();
        this.element.append(this.template());
    };

    SuccessView.prototype.destroy = function() {

    };


    /**
     * View for creating a new Composite property and
     * performing augmentation.  Delegates to other views for
     * the various steps in the augmentation process.
     *
     * @param options
     * @constructor
     */
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

    $.extend(CompositePropertyView.prototype, {
        render: function() {
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
        },

        swapComponent: function(component) {
            this.component.destroy();
            this.component = component;
            this.component.render();
        },

        createPropertySuccessHandler: function() {
            this.swapComponent(new ProgressView({
                element: this.element,
                model: this.model,
                observer: this.Observer
            }));
        },

        createPropertyFailureHandler: function(status) {
            this.swapComponent(new ErrorView({
                element: this.element,
                model: this.model,
                observer: this.Observer,
                delete_property: false,
                message: "Unable to create property"
            }));
        },

        augmentDataSuccessHandler: function(property) {

        },
        exhibitLoadSuccessHandler: function() {
            this.Observer("createProperty").publish(this.model.id());
            this.swapComponent(new SuccessView({
                element: this.element,
                database: this.database,
                model: this.model,
                observer: this.Observer
            }));
            $(document).off("onAfterLoadingItems.exhibit", this.exhibitLoadSuccessHandler.bind(this));
        },
        exhibitLoadFailureHandler: function() {
            this.swapComponent(new ErrorView({
                element: this.element,
                model: this.model,
                observer: this.Observer,
                delete_property: true,
                message: "Unable to load the returned data"
            }));
            $(document).off("onAfterLoadingItems.exhibit", this.exhibitLoadSuccessHandler.bind(this));

        },
        loadDataSuccessHandler: function(property) {
            if (property.items.length > 0) {
                var data = {"items": property.items, "properties": {}}
                data.properties[property._id] = property.toJSON();

                $(document).on("onAfterLoadingItems.exhibit", this.exhibitLoadSuccessHandler.bind(this));
                this.database.loadData(data);
            } else {
                this.swapComponent(new ErrorView({
                    element: this.element,
                    model: this.model,
                    observer: this.Observer,
                    delete_property: true,
                    message: "No data returned"
                }));
            }

        },

        augmentDataFailureHandler: function(property) {
            this.swapComponent(new ErrorView({
                element: this.element,
                model: this.model,
                observer: this.Observer,
                delete_property: true,
                message: "Communication error"
            }));
        },

        destroy: function() {

            this.model.Observer("createPropertySuccess").unsubscribe(
                this.createPropertySuccessHandler.bind(this));
            this.model.Observer("createPropertyFailure").unsubscribe(
                this.createPropertyFailureHandler.bind(this));
            this.model.Observer("augmentDataSuccess").unsubscribe(
                this.augmentDataSuccessHandler.bind(this));
            this.model.Observer("augmentDataFailure").unsubscribe(
                this.augmentDataFailureHandler.bind(this));
            this.model.Observer("loadDataSuccess").unsubscribe(
                this.loadDataSuccessHandler.bind(this));

            this.component.destroy();
        }

    });
    return CompositePropertyView;
});

