define([
    "jquery",
    "handlebars",
    "layout/models/composite-property",
    "./property-multiselect-component",
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
        this.element.empty();
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
    }

    $.extend(ErrorView.prototype, {
        template: Handlebars.compile(error_template),

        render: function() {
            this.element.empty();
            this.element.append(this.template({message: this.message}));
            this.findOkButton().on('click', this.okButtonHandler.bind(this));
            this.findOkButton().attr('disabled', true);
            if (this.delete_property) {
                this.model.Observer('deletePropertySuccess').subscribe(this.deletePropertyHandler.bind(this));
                this.model.deleteProperty();
            }
        },

        destroy: function()  {
            if (this.delete_property) {
                this.model.Observer('deletePropertySuccess').subscribe(this.deletePropertyHandler.bind(this));
            }
            this.element.empty();
            this.findOkButton().off('click', this.okButtonHandler.bind(this));
        },

        deletePropertyHandler: function() {
            this.findOkButton().removeAttr('disabled');
        },

        okButtonHandler: function() {
            this.Observer("rejectProperty").publish(this.model);
        },
        findOkButton: function() {
            return this.element.find("button#property_cancel_button");
        }

    });


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

    $.extend(SuccessView.prototype, {
        template: Handlebars.compile(success_template),

        render: function() {
            this.element.empty();
            this.element.append(this.template({
                record_count: this.model.items.length,
                total_count: this.database.getAllItemsCount()
            }));
            var property = this.model;
            var data = {"items": property.items, "properties": {}};
            data.properties[property._id] = property.toJSON();

            $(document).on("onAfterLoadingItems.exhibit", this.exhibitLoadSuccessHandler.bind(this));
            try {
                this.database.loadData(data);
            } catch (ex) {
                console.log(ex);
            }
        },

        destroy: function() {
            $(document).off("onAfterLoadingItems.exhibit", this.exhibitLoadSuccessHandler.bind(this));
            this.element.empty();
        },

        exhibitLoadSuccessHandler: function() {
            this.Observer("createProperty").publish(this.model.id());
            setTimeout(function() {
                this.Observer("acceptProperty").publish(this.model);
            }.bind(this), 3000);

        },
        exhibitLoadFailureHandler: function() {
            this.swapComponent(new ErrorView({
                element: this.element,
                model: this.model,
                observer: this.Observer,
                delete_property: true,
                message: "Unable to load the returned data"
            }));
        }

    });

    /**
     * View for creating a new Composite property and
     * performing augmentation.  Delegates to other views for
     * the various steps in the augmentation process.
     *
     * @param options
     * @constructor
     */
    function CompositePropertyView(options) {
        this.initialize.apply(this, [options]);
    }


    $.extend(CompositePropertyView.prototype, {

        initialize: function(options) {
            this.element = options.element;
            this.database = options.database;
            this.model = new CompositePropertyModel({
                id: undefined,
                label: undefined,
                type: this.property_type,
                value: [],
                augmentation: 'composite',
                composite: [],
                property_url: "properties/"
            });

            this.Observer = new Observer().Observer;

            this.component = new this.SettingsView({
                element: this.element,
                database: this.database,
                model: this.model,
                observer: this.Observer
            });
        },

        property_type: 'NOT IMPLEMENTED',
        error_message: 'NOT IMPLEMENTED',
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

        loadDataSuccessHandler: function(property) {
            if (property.items.length > 0) {
                this.swapComponent(new SuccessView({
                    element: this.element,
                    database: this.database,
                    model: this.model,
                    observer: this.Observer
                }));

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
                message: this.error_message
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

