define(["jquery", "handlebars", "display/facets/numeric", "exhibit",
        "scripts/data/database/range-index",
        "scripts/util/date-time",
        "text!templates/layout/facets/numeric-facet-editor.html",
        "lib/jquery.nouislider"],
        function ($, Handlebars, Facet, Exhibit, RangeIndex, DateTime, template_html) {
        "use strict"

    Facet.prototype.exhibitClass = Exhibit.NumericRangeFacet;
    Facet.prototype.propertyTypes = ["number", "currency", "datetime"];
    Facet.prototype.icon_class = "fa fa-tasks fa-3x";

    Facet.prototype.label = "Range";
    Facet.prototype.template = Handlebars.compile(template_html);

    Facet.prototype.setupEditor = function (config, template) {
        var facet = this;

        function roundPow10(value) {
            return Math.pow(10, Math.ceil(Math.log(value) / Math.log(10)));
        }

        function updateSlider() {
            var slider = template.find("#range_interval_slider");
            var input = template.find("#range_interval");
            var database = Freemix.getBuilderExhibit().getUIContext().getDatabase();
            if (config.expression) {
                var path = Exhibit.ExpressionParser.parse(config.expression).getPath();

                var propertyID = path.getLastSegment().property;
                var property = database.getProperty(propertyID);
                if (!property._builderRangeIndex) {
                    property._builderRangeIndex = new RangeIndex(
                        database.getAllItems(),
                        function (item, f) {
                            database.getObjects(item, property.getID(), null, null).visit(function (value) {
                                if (property.getValueType() === "date") {
                                    if (typeof value !== "undefined" && value !== null && !(value instanceof Date)) {
                                        value = DateTime.parseIso8601DateTime(value);
                                    }
                                } else if (typeof value !== "number") {
                                    value = parseFloat(value);
                                }
                                if (value instanceof Date) {
                                    f(value.getTime());
                                } else if (!isNaN(value)) {
                                    f(value);
                                }
                            });
                        }
                    )
                }
                var rangeIndex = property._builderRangeIndex;
                var delta = rangeIndex.getMax() - rangeIndex.getMin();


                var max = roundPow10(Math.ceil(delta / 2));
                var min = Math.max(Math.ceil(delta / 100), 1);
                if (min > 100) {
                    min = Math.floor(min / 100) * 100;
                }
            } else {
                min = max = NaN;
            }

            var base = roundPow10(min);
            var step = Math.ceil(base / 100);

            clampInterval(base, {"min": min, "max": max});

            if (!isNaN(config.interval)) {
                slider.noUiSlider({
                    handles: 1,
                    range: [min, max],
                    start: [config.interval],
                    step: step
                }, true);
                slider.attr("disabled", false);
                interval.attr("disabled", false);
            } else {
                slider.attr("disabled", true);
                interval.attr("disabled", true);
                interval.val("No valid range");
            }

        }

        function clampInterval(base, range) {
            var input = template.find("#range_interval");
            if (config.interval < range.min || isNaN(config.interval)) {

                base = base || range.min;
                config.interval = base;
            }

            config.interval =  isNaN(interval) ? range.max : Math.min(config.interval, range.max);

            input.val(config.interval);
        }

        var select = template.find("#facet_property");
        this._setupPropertySelect(config, template, select, "expression", this.propertyTypes, false, true);
        select.off('change').change(function () {
            config.expression = $(this).val();
            updateSlider();
            facet.triggerChange(config, template);
        });


        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function () {
            config.name = label.val();
            facet.triggerChange(config, template);
        });

        var interval = template.find("#range_interval");
        var slider = template.find("#range_interval_slider");

        interval.val(config.interval);
        interval.change(function (event) {
            config.interval = parseInt($(event.target).val());

            slider.val(config.interval);
            facet.triggerChange(config, template);

        });

        slider.change(function (event) {
            interval.val(slider.val());
            config.interval = slider.val();
            facet.triggerChange(config, template);
            return true;
        });

        select.change();


    };

    Facet.prototype.validate = function(config) {
        this.errors = [];
        if (!config.expression) {
            this.errors.push("This widget requires a property with a type of 'number'");
        } else if (isNaN(config.interval)) {
            this.errors.push("Unable to extract a range interval for this property")
        }
        return this.errors == 0;
    };

    return Facet;
});
