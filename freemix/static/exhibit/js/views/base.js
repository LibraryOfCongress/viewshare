(function($, Freemix) {
    "use strict";
    var expression = Freemix.exhibit.expression;

    Freemix.view = {
        prototypes: {},
        construct: function(type, config) {
             var Type = Freemix.view.prototypes[type];
             return new Type(config);
        },
        register: function(config, render_function) {
            var View = function(config) {
               Freemix.view.BaseView.call(this,config);
            };
            View.prototype = new Freemix.view.BaseView();
            View.prototype.config = config;
            View.prototype.generateExhibitHTML = render_function;
            var type = config.type;
            Freemix.view.prototypes[type] = View;
            return View;
        }
    };

    Freemix.view.BaseView = function(config) {
        Freemix.Widget.call(this,config);
    };

    Freemix.view.BaseView.prototype = new Freemix.Widget();

    Freemix.view.BaseView.prototype.generateExhibitHTML = function(config) {
        var config = config || this.config;
    };

    Freemix.view.BaseView.prototype._getLens = function(config) {
        var config = config || this.config;
        return Freemix.lens.construct(config.lens);
    };

    Freemix.view.BaseView.prototype._mapExpressions = function (arr) {
        return $.map(arr, expression).join(",");
    };

    Freemix.view.BaseView.prototype._renderFormats = function(view, config) {
        config = config || this.config;
        var lens= this._getLens(config);
        if (lens && lens.config.title) {
           view.attr("ex:formats", "item {title:expression(" + expression(lens.config.title) + ")}");
        }
    };

    Freemix.view.BaseView.prototype._renderOrder = function(view, config) {
        config = config || this.config;
        var lens = this._getLens(config);
        if (config.orders && (config.orders.length > 0)) {
            view.attr("ex:orders", this._mapExpressions(config.orders));
            if (config.directions && (config.directions.length === config.orders.length)) {
                view.attr("ex:directions", config.directions.join(","));
            }
        } else {
            if (lens && lens.config.title) {
                view.attr("ex:orders", expression(lens.config.title));
            }
            if (config.directions && (config.directions.length > 0)) {
                view.attr("ex:directions", config.directions[0]);
            }
        }

        if (config.possibleOrders && config.possibleOrders.length > 0) {
            view.attr("ex:possibleOrders", this._mapExpressions(config.possibleOrders));
        }

    };

})(window.Freemix.jQuery, window.Freemix);
