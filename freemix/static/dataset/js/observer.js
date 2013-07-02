/*global define */
define(['jquery'], function ($) {
  'use strict';
  /**
   * Create an Observer pattern for publish/subscribe event handling
   * Copied from http://api.jquery.com/jQuery.Callbacks/
   * @constructor
   * @param {string} id - name of custom event
   */
  var Observer = function() {
    var
      events = {},
      callbackManager = function(id) {
        var callbacks,
        event = id && events[id];

        if (!event) {
          callbacks = $.Callbacks();
          event = {
            publish: callbacks.fire,
            subscribe: callbacks.add,
            unsubscribe: callbacks.remove
          };
          if (id) {
            events[id] = event;
          }
        }
        return event;
      },
      self = {
        Observer: callbackManager
      };

      return self;
  };

  return Observer;
});
