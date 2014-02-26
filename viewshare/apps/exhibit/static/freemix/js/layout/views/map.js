define(["jquery",
        "display/views/map",
        "freemix/js/freemix",

        "ext/openlayers/scripts/openlayers-view",
        "handlebars",
        "text!templates/layout/views/map-view.html",
        "text!templates/layout/views/map-view-settings.html",
        "./location-property-view"],
        function ($, View, Freemix, OLMapView, Handlebars, template_html, settings_html, LocationPropertyView) {
        "use strict"

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

            edit.off("hide").on("hide", function() {
                root.empty();
            });
        });
        augment.off("show").on("show", function() {
            var location_view = view.renderLocationPropertyView(augment);

            location_view.Observer("cancel").subscribe(function() {
                edit.collapse("show");
            });

            location_view.Observer("rejectProperty").subscribe(function() {
                augment.one("hidden", function() {
                    location_view.destroy();
                    augment.collapse("show");
                })
                augment.collapse("hide");
            });

            location_view.Observer("acceptProperty").subscribe(function(property) {
                config.latlng = property.id();
                edit.collapse("show");
                augment.collapse("hide");
            });


            augment.off("hidden").on("hidden", function() {
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

    View.prototype.renderLocationPropertyView = function(root) {
        var view = new LocationPropertyView({
            element: root,
            database: Freemix.getBuilderExhibit().getUIContext().getDatabase()
        });

        view.render();

        return view;
    }

    return View;
});