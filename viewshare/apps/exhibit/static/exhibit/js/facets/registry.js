define(["freemix/js/lib/jquery", "exhibit/js/facets/base"],
    function ($, BaseFacet) {
    "use strict"
    var prototypes = {}
    return {
        prototypes: {},
        construct: function (type, config) {
            var Type = prototypes[type];
            return new Type(config);
        },
        register: function (config, render_function) {
            var Facet = function (config) {
                BaseFacet.call(this, config);
            };
            Facet.prototype = new BaseFacet();
            Facet.prototype.config = config;
            Facet.prototype.generateExhibitHTML = render_function;
            var type = config.type;
            prototypes[type] = Facet;
            return Facet;
        }
    };
});