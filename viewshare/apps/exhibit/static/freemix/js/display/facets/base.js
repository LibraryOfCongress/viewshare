define(["jquery", "freemix/js/widget"],
    function ($, Widget) {
    "use strict";


    var BaseFacet = function(config) {
        Widget.call(this,config);
    };

    BaseFacet.prototype = new Widget();

    BaseFacet.prototype.generateExhibitHTML = function() {};

    return BaseFacet;
});
