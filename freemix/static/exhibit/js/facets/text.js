(function ($, Freemix, Parse) {
    "use strict";
    var creole = new Parse.Simple.Creole({
        forIE:document.all,
        interwiki:{

        },
        linkFormat:''
    });
    $.fn.creole = function (text) {

        return this.each(function () {
            if (text) {
                creole.parse($(this).get(0), text);
            }
        });
    };

    var config = {
        type:"text",
        name: "Text",
        text:undefined
    };

    var render = function() {
        return $("<div class='text-facet exhibit-facet'>").creole(this.config.text);
    };

    Freemix.facet.register(config,render);

})(window.Freemix.jQuery, window.Freemix, window.Parse);
