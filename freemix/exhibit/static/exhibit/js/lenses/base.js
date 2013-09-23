(function ($, Freemix) {
    "use strict";
    var expression = Freemix.exhibit.expression;

    Freemix.lens = {
        prototypes: {},
        _hash: {},
        _array: [],
        construct: function (config) {
            if (config) {
                var Type = Freemix.lens.prototypes[config.type];
                return new Type(config);
            }
            return this.copyDefaultLens();
        },
        register: function (config, render_function) {
            var Lens = function (config) {
                Freemix.lens.BaseLens.call(this, config);
            };
            Lens.prototype = new Freemix.lens.BaseLens();
            Lens.prototype.config = config;
            Lens.prototype.generateExhibitHTML = render_function;
            var type = config.type;
            Freemix.lens.prototypes[type] = Lens;
            return Lens;
        },
        getLens: function (config) {
            var lens;
            if (id) {
                lens = Freemix.lens._hash[id];
            }
            if (!config) {
                lens = this.getDefaultLens();
            }
            return lens;
        },
        getDefaultLens: function () {
            var lens;
            if (this._default_lens) {
                lens = this._default_lens;
            } else {
                lens = this.createBasicLens();
                this.setDefaultLens(lens);
            }

            return lens;
        },
        setDefaultLens: function (lens) {
            this._default_lens = lens;

        },
        copyDefaultLens: function() {
            var config = $.extend(true, {}, this.getDefaultLens().config);
            return Freemix.lens.construct(config);
        },
        createBasicLens: function () {
            return this.construct({
                "type": "list",
                "properties": Freemix.exhibit.database.getFilteredProperties()
            });
        }
    };

    Freemix.lens.BaseLens = function (config) {
        Freemix.Widget.call(this, config);
    };

    Freemix.lens.BaseLens.prototype = new Freemix.Widget();

    Freemix.lens.BaseLens.prototype.generateExhibitHTML = function (config) {
    };

})(window.Freemix.jQuery, window.Freemix);
