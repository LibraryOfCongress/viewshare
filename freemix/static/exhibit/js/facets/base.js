(function($, Freemix, Exhibit) {
    "use strict";

    Freemix.facet = {
       prototypes: {},
       construct: function(type, config) {
            var Type = Freemix.facet.prototypes[type];
            return new Type(config);
       },
       register: function(config, render_function) {
           var Facet = function(config) {
               Freemix.facet.BaseFacet.call(this,config);
           };
           Facet.prototype = new Freemix.facet.BaseFacet();
           Facet.prototype.config = config;
           Facet.prototype.generateExhibitHTML = render_function;
           var type = config.type;
           Freemix.facet.prototypes[type] = Facet;
           return Facet;
       }
   };

    Freemix.facet.BaseFacet = function(config) {
        Freemix.Widget.call(this,config);
    };

    Freemix.facet.BaseFacet.prototype = new Freemix.Widget();

    Freemix.facet.BaseFacet.prototype.generateExhibitHTML = function() {};

})(window.Freemix.jQuery, window.Freemix, window.Exhibit);
