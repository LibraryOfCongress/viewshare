define(["jquery", "handlebars", "display/facets/numeric", "exhibit",
        "scripts/data/database/range-index",
        "scripts/util/date-time",
        "text!templates/layout/facets/numeric-facet-editor.html"],
        function ($, Handlebars, Facet, Exhibit, RangeIndex, DateTime, template_html) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.NumericRangeFacet;
    Facet.prototype.propertyTypes = ["number", "currency"];
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
            var path = Exhibit.ExpressionParser.parse(config.expression).getPath();

            var propertyID = path.getLastSegment().property;
            var property = database.getProperty(propertyID);
            if (!property._builderRangeIndex) {
                property._builderRangeIndex = new RangeIndex(
                    database.getAllItems(),
                    function(item, f) {
                        database.getObjects(item, property.getID(), null, null).visit(function(value) {
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

            var base = roundPow10(min);
            var step = Math.ceil(base / 100);

            input.data("range", {"min": min, "max": max});

            clampInterval(base);

            slider.slider('option', {
                max: max,
                min: min,
                value: config.interval,
                step: step
            });


        }

        function clampInterval(base, range) {
            var input = template.find("#range_interval");
            var range = input.data("range");
            if (config.interval < range.min || isNaN(config.interval)) {

                base = base || range.min;
                config.interval = base;
            }
            var interval = Math.min(config.interval, range.max);
            config.interval = interval;
            input.val(config.interval);
        }

        var select = template.find("#facet_property");
        this._setupPropertySelect(config, template, select, "expression", this.propertyTypes);
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
            var interval = parseInt($(event.target).val());
            config.interval =interval;

            slider.slider("value", config.interval);
            facet.triggerChange(config, template);

        });

        slider.slider({
            slide: function (event, ui) {
                interval.val(ui.value);
                config.interval = ui.value;
                facet.triggerChange(config, template);
                return true;
            }
        });

        select.change();


    };

    return Facet;
});
