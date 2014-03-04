define(["jquery",
        "display/views/map",
        "freemix/js/freemix",

        "ext/openlayers/scripts/openlayers-view",
        "handlebars",
        "text!templates/layout/views/map-view.html",
        "text!templates/layout/views/map-view-settings.html",
        "text!templates/layout/views/location-property.html",
        "./augmentation/composite-property-view",
        "./augmentation/composite-settings-view"],
        function ($,
                  View,
                  Freemix,
                  OLMapView,
                  Handlebars,
                  template_html,
                  settings_html,
                  augment_settings_html,
                  CompositePropertyView,
                  CompositeSettingsView) {
        "use strict";



    var SettingsView = function(options) {
        this.initialize.apply(this, [options]);
    }

    $.extend(SettingsView.prototype, CompositeSettingsView.prototype, {
        template: Handlebars.compile(augment_settings_html),
        property_label: "Coordinates"
    });

    var LocationPropertyView = function(options) {
        this.initialize.apply(this, [options]);
    }

    $.extend(LocationPropertyView.prototype, CompositePropertyView.prototype, {
        property_type: "location",
        error_message: "We were unable to generate any latitude,longitude data based on the properties you have selected.",
        SettingsView: SettingsView
    });

    View.prototype.propertyTypes = ["location"];

    View.prototype.label = "Map";

    View.prototype.icon_class = "fa fa-globe fa-3x";

    View.prototype.viewClass = OLMapView;

    View.prototype.template = Handlebars.compile(template_html);

    View.prototype.setupEditor = function (config, template) {
        var view = this;

        var augment = template.find("#collapseAugment");
        var edit = template.find("#collapseEdit");

        edit.off("show").on("show", function() {

            var root = edit;
            root.append(settings_html);
            view.renderSettings(config, root);

            edit.find("a.augment").off("click").on("click",function(evt) {
                evt.preventDefault();
                augment.collapse("show");
                edit.collapse("hide");
                return false;
            });

            edit.off("hidden").on("hidden", function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                root.empty();
            });
        });
        augment.off("show").on("show", function() {
            var location_view = view.renderDatePropertyView(augment);

            location_view.Observer("cancel").subscribe(function() {
                edit.collapse("show");
                augment.collapse("hide");
            });

            location_view.Observer("rejectProperty").subscribe(function() {
                augment.one("hidden", function() {
                    location_view.destroy();
                    augment.collapse("show");
                });
                augment.collapse("hide");
            });

            location_view.Observer("acceptProperty").subscribe(function(property) {
                config.latlng = property.id();
                edit.collapse("show");
                augment.collapse("hide");
            });


            augment.off("hidden").on("hidden", function(evt) {
                evt.preventDefault();
                evt.stopPropagation();

                location_view.destroy();
            });
        });

        var database = Freemix.getBuilderExhibit().getUIContext().getDatabase();

        if (database.getPropertiesWithTypes(["location"]).length > 0) {
            edit.collapse("show");
        } else {
            augment.collapse("show");
        }
    };

    View.prototype.renderSettings = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var latlng = template.find("#latlng_property");
        this._setupPropertySelect(config, template, latlng, "latlng", ['location']);
        latlng.change();

        var color = template.find("#color_property");
        this._setupPropertySelect(config, template, color, "colorKey", [], true);
        color.change();

        var zoom = template.find("#zoom_level");
        this._setupSelectPropertyHandler(config, template, zoom, "zoom");
        zoom.change();

        this._setupLensEditor(config, template);
    };

    View.prototype.renderDatePropertyView = function(root) {
        var view = new LocationPropertyView({
            element: root,
            database: Freemix.getBuilderExhibit().getUIContext().getDatabase()
        });

        view.render();

        return view;
    };

    return View;
});