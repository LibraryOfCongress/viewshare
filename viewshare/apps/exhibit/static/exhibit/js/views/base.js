define(["jquery",
        "exhibit/js/widget",
        "exhibit/js/lenses/registry",
        "freemix/js/freemix"],
    function ($, Widget, LensRegistry, Freemix) {
    "use strict";

    var expression = Freemix.exhibit.expression;


    var BaseView = function(config) {
        Widget.call(this,config);
    };

    BaseView.prototype = new Widget();

    BaseView.prototype.generateExhibitHTML = function(config) {
        var config = config || this.config;
    };

    BaseView.prototype._getLens = function(config) {
        var config = config || this.config;
        return LensRegistry.construct(config.lens);
    };

    BaseView.prototype._mapExpressions = function (arr) {
        return $.map(arr, expression).join(",");
    };

    BaseView.prototype._renderFormats = function(view, config) {
        config = config || this.config;
        var lens= this._getLens(config);
        if (lens && lens.config.title) {
           view.attr("data-ex-formats", "item {title:expression(" + expression(lens.config.title) + ")}");
        }
    };

    BaseView.prototype._renderOrder = function(view, config) {
        config = config || this.config;
        var lens = this._getLens(config);
        if (config.orders && (config.orders.length > 0)) {
            view.attr("data-ex-orders", this._mapExpressions(config.orders));
            if (config.directions && (config.directions.length === config.orders.length)) {
                view.attr("data-ex-directions", config.directions.join(","));
            }
        } else {
            if (lens && lens.config.title) {
                view.attr("data-ex-orders", expression(lens.config.title));
            }
            if (config.directions && (config.directions.length > 0)) {
                view.attr("data-ex-directions", config.directions[0]);
            }
        }

        if (config.possibleOrders && config.possibleOrders.length > 0) {
            view.attr("data-ex-possible-orders", this._mapExpressions(config.possibleOrders));
        }

    };

    return BaseView;
});
