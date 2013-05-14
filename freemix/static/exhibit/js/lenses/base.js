(function ($, Freemix) {
    "use strict";
    var expression = Freemix.exhibit.expression;

    Freemix.lens = {
        prototypes: {},
        _hash: {},
        _array: [],
        construct: function (type, config) {
            var Type = Freemix.lens.prototypes[type];
            return new Type(config);
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
        load: function (collection, default_lens) {
            $.each(collection, function (inx, config) {
                var lens = Freemix.lens.construct(config.type, config);
                Freemix.lens.add(lens);
            });
            this.setDefaultLens(this.getLens(default_lens));
        },
        getLens: function (id) {
            var lens;
            if (id) {
                lens = Freemix.lens._hash[id];
            }
            if (!lens) {
                lens = this.getDefaultLens();
            }
            return lens;
        },
        getDefaultLens: function () {
            var lens;
            if (this._default_lens) {
                lens = this._default_lens;
            } else if (this._array.length > 0) {
                lens = this._array[0];
                this.setDefaultLens(lens);
            } else {
                lens = this.createBasicLens();
                this.setDefaultLens(lens);
            }

            return lens;
        },
        setDefaultLens: function (lens) {
            this._default_lens = lens;

        },
        add: function (lens) {
            if (lens.config.id in this._hash) {
                for (var inx = 0; inx < this._array.length; inx++) {
                    if (lens.config.id === this._array[inx].config.id) {
                        this._array[inx] = lens;
                    }
                }
            } else {
                this._array.push(lens);
            }

            this._hash[lens.config.id] = lens;
        },
        createBasicLens: function () {
            var lens = this.construct("list", {
                "properties": Freemix.exhibit.database.getFilteredProperties(),
                "id": $.make_uuid()
            });
            this.add(lens);
            return lens;
        }
    };

    Freemix.lens.BaseLens = function (config) {
        Freemix.Widget.call(this, config);
    };

    Freemix.lens.BaseLens.prototype = new Freemix.Widget();

    Freemix.lens.BaseLens.prototype.generateExhibitHTML = function (config) {
    };

})(window.Freemix.jQuery, window.Freemix);
