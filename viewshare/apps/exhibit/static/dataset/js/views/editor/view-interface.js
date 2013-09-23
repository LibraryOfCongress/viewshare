/*global define */
define(['observer'], function (Observer) {
    'use strict';
    /** singleton for composition of common view features */
    var ViewInterface = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(ViewInterface.prototype, {
        initialize: function() {
            this.Observer = new Observer().Observer;
        }
    });

    return new ViewInterface();
});
