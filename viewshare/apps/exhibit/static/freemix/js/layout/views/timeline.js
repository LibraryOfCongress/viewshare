define(["jquery",
        "display/views/timeline",
        "freemix/js/freemix",

        "ext/time/scripts/timeline-view",
        "handlebars",
        "text!templates/layout/views/timeline-view.html",
        "text!templates/layout/views/timeline-view-settings.html",
        "text!templates/layout/views/date-property.html",
        "./augmentation/composite-property-view",
        "./augmentation/composite-settings-view"],
        function ($,
                  View,
                  Freemix,
                  TimelineView,
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
        property_label: "Date"
    });

    var DatePropertyView = function(options) {
        this.initialize.apply(this, [options]);
    }

    $.extend(DatePropertyView.prototype, CompositePropertyView.prototype, {
        property_type: "date",
        error_message: "We were unable to generate any ISO date data based on the properties you have selected.",
        SettingsView: SettingsView
    });

    View.prototype.label = "Timeline";
    View.prototype.propertyTypes = ["date"];
    View.prototype.viewClass = TimelineView;
    View.prototype.template = Handlebars.compile(template_html);
    View.prototype.icon_class = "fa fa-align-center fa-3x";

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

            edit.off("hide").on("hide", function() {
                root.empty();
            });
        });
        augment.off("show").on("show", function() {
            var date_view = view.renderDatePropertyView(augment);

            date_view.Observer("cancel").subscribe(function() {
                edit.collapse("show");
                augment.collapse("hide");
            });

            date_view.Observer("rejectProperty").subscribe(function() {
                augment.one("hidden", function() {
                    date_view.destroy();
                    augment.collapse("show");
                });
                augment.collapse("hide");
            });

            date_view.Observer("acceptProperty").subscribe(function(property) {
                config.startDate = property.id();
                edit.collapse("show");
                augment.collapse("hide");
            });


            augment.off("hidden").on("hidden", function() {
                date_view.destroy();
            });
        });

        var database = Freemix.getBuilderExhibit().getUIContext().getDatabase();

        if (database.getPropertiesWithTypes(["date"]).length > 0) {
            edit.collapse("show");
        } else {
            augment.collapse("show");
        }
    };

    View.prototype.renderSettings = function(config, template) {
        this._setupViewForm(config, template);
        this._setupLabelEditor(config, template);

        var start = template.find("#start_property");
        var end = template.find("#end_property");
        var color = template.find("#color_property");
        var top_band = template.find("#top-band-unit");
        var bottom_band = template.find("#bottom-band-unit");

        this._setupSelectPropertyHandler(config, template, top_band, "topBandUnit");
        this._setupSelectPropertyHandler(config, template, bottom_band, "bottomBandUnit");

        this._setupPropertySelect(config, template, start, "startDate", this.propertyTypes);
        this._setupPropertySelect(config, template, end, "endDate", this.propertyTypes, true);
        this._setupPropertySelect(config, template, color, "colorKey", [], true);
        this._setupLensEditor(config, template);


        top_band.change();
        bottom_band.change();
        start.change();
        end.change();
        color.change();
    };

    View.prototype.renderDatePropertyView = function(root) {
        var view = new DatePropertyView({
            element: root,
            database: Freemix.getBuilderExhibit().getUIContext().getDatabase()
        });

        view.render();

        return view;
    };

    return View;
});