define(["jquery", "display/facets/numeric", "exhibit"],
        function ($, Facet, Exhibit) {
        "use strict"

    Facet.prototype.facetClass = Exhibit.NumericRangeFacet;
    Facet.prototype.propertyTypes = ["number", "currency"];
    Facet.prototype.icon_class = "fa fa-tasks fa-3x";

    Facet.prototype.label = "Range";
    Facet.prototype.template_name = "numeric-facet-editor";

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
            var rangeIndex = property.getRangeIndex();

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

        function clampInterval(base) {
            var input = template.find("#range_interval");
            var range = input.data("range");
            if (config.interval < range.min) {

                base = base || range.min;
                config.interval = base;
            }
            config.interval = Math.min(config.interval, range.max);
            input.val(config.interval);
        }

        var select = template.find("#facet_property");
        this._setupPropertySelect(config, template, select, "expression", this.propertyTypes);
        select.off('change').change(function () {
            config.expression = $(this).val();
            updateSlider();
            template.trigger(facet.refreshEvent);
        });


        var label = template.find("#facet_name");
        label.val(config.name);
        label.change(function () {
            config.name = label.val();
            template.trigger(facet.refreshEvent);
        });

        var interval = template.find("#range_interval");
        var slider = template.find("#range_interval_slider");

        interval.val(config.interval);
        interval.change(function (event) {
            config.interval = parseInt($(event.target).val());
            slider.slider("value", config.interval);
            template.trigger(facet.refreshEvent);

        });

        slider.slider({
            slide: function (event, ui) {
                interval.val(ui.value);
                config.interval = ui.value;
                template.trigger(facet.refreshEvent);
                return true;
            }
        });

        select.change();


    };

    return Facet;
});
