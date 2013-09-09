/*global define */
define(['observer'], function (Observer) {
  'use strict';
  /** singleton for composition of common view features */
  var ViewInterface = function(options) {
    this.initialize.apply(this, [options]);
  };

  var ViewInterfaceObserver = new Observer();

  $.extend(ViewInterface.prototype, ViewInterfaceObserver.prototype, {
      initialize: function() {}
  });

  return new ViewInterface();
});
