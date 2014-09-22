define(["jquery", "display/facets/base"],
    function ($, BaseFacet) {
    "use strict"

    var Registry = function() {
        this.prototypes = {};
        this.type_order = [];
    };

    Registry.prototype.construct = function (type, config) {
        var Type = this.prototypes[type];
        return new Type(config);
    };

    Registry.prototype.register = function (config, render_function) {
        var Facet = function (config) {
            BaseFacet.call(this, config);
        };
        Facet.prototype = new BaseFacet();
        Facet.prototype.config = config;
        Facet.prototype.generateExhibitHTML = render_function;
        var type = config.type;
        this.prototypes[type] = Facet;
        this.type_order.push(type);
        return Facet;
    };

    return new Registry();
});
