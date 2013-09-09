/*global define */
define(['observer'], function (Observer) {
    'use strict';
    /** singleton for composition of common view features */
    var ViewInterface = function(options) {
        this.Observer = new Observer().Observer;
        this.initialize.apply(this, [options]);
    };

    $.extend(ViewInterface.prototype, {
        initialize: function() {}
    });

    return new ViewInterface();
});
