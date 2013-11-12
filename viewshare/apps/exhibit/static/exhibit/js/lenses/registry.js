define(["freemix/js/lib/jquery", "exhibit/js/lenses/base", "freemix/js/freemix"],
    function($, BaseLens, Freemix) {
    "use strict";

    var prototypes = {};

    return {
        _array: [],
        construct: function (config) {
            if (config) {
                var Type = prototypes[config.type];
                return new Type(config);
            }
            return this.copyDefaultLens();
        },
        register: function (config, render_function) {
            var Lens = function (config) {
                BaseLens.call(this, config);
            };
            Lens.prototype = new BaseLens();
            Lens.prototype.config = config;
            Lens.prototype.generateExhibitHTML = render_function;
            var type = config.type;
            prototypes[type] = Lens;
            return Lens;
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
        copyDefaultLens: function () {
            var config = $.extend(true, {}, this.getDefaultLens().config);
            return this.construct(config);
        },
        createBasicLens: function () {
            return this.construct({
                "type": "list",
                "properties": Freemix.exhibit.database.getFilteredProperties()
            });
        }
    };
});