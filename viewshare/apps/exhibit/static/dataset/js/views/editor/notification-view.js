/*global define */
define([
       'handlebars',
       'jquery',
       'text!templates/notification.html'
    ], function (
        Handlebars,
        $,
        notificationTemplate
    ) {
    'use strict';
    /**
     * View to display notifications. Any model that publishes an event that
     * should be picked up by the Notification view should include the
     * following data:
     * notificationLevel - 'info', 'warning', 'error', or 'success'
     * message - text displayed in the notification
     * lead (option) - bold type that appears at the beginning of the message
     * @constructor
     * @param {object} options.$el - container Element object for this view
     */
    var NotificationView = function(options) {
        this.initialize.apply(this, [options]);
    };

    $.extend(NotificationView.prototype, {
        initialize: function(options) {
            this.$el = options.$el;
        },

        /** Compile the template we will use to render the View */
        template: Handlebars.compile(notificationTemplate),

        /** Create a visual notification on a specified observable's event
         * @param {object} observable - Object that extends observer.js
         * @param {string} eventName - Name of the event NotificationView will handle
         * @return {func} notificationFunc - The function to be fired
         * on 'eventName'. This is used for removeSubscription.
         */
        addSubscription: function(
            observable,
            eventName,
            notificationLevel,
            message,
            lead,
            shouldFade
        ) {
            var notificationFunc = this.renderNotification.bind(
                this, notificationLevel, message, lead, shouldFade);
            observable.Observer(eventName).subscribe(notificationFunc);
            return notificationFunc;
        },

        /** Remove a notification subscription
         * @param {object} observable - Object that extends observer.js
         * @param {string} eventName - Name of the event NotificationView will handle
         * @param {func} notificationFunc - Function that was returned
         * from addSubscription
         */
        removeSubscription: function(observable, eventName, notificationFunc) {
            observable.Observer(eventName).unsubscribe(notificationFunc);
        },

        /**
         * Add a visual notification to the DOM
         * @param {string} notificationLevel - 'alert'|'info'|'error'
         * @param {string|object} message - text or instance of a View
         * to display in the notification
         * @param {string} lead - (optional) lead text to display in bold
         */
        renderNotification: function(
            notificationLevel,
            message,
            lead,
            shouldFade
        ) {
            var editorAlert, notification, notificationMessage, isView;
            var status = 'alert';
            lead = lead || '';
            if (typeof shouldFade !== 'boolean') {
                shouldFade = true;
            }
            if (notificationLevel === 'info') {
                status = 'alert alert-info editor-notification';
            } else if (notificationLevel === 'error') {
                status = 'alert alert-error editor-notification';
            } else if (notificationLevel === 'success') {
                status = 'alert alert-success editor-notification';
            }
            isView = typeof message.render === 'function';
            if (isView) {
                // this is a View that we'd like to render but we have to
                // do it after the notification has been added to the dom
                notificationMessage = '';
            } else {
                notificationMessage = message;
            }
            notification = this.template({
                status: status,
                message: notificationMessage,
                lead: lead
            });
            this.$el.append(notification);
            if (isView) {
                message.$el = this.$el.find('#notificationMsg');
                message.render();
                this.$el.animate({
                    height: message.$el.height() + 20
                }, 200);
            }

            if (shouldFade === true) {
                window.setTimeout(function () {
                    this.$el.children().fadeOut(
                        2000,
                        "linear",
                        function() {
                            this.$el.empty();
                        }.bind(this));
                    }.bind(this), 4000);
            }
        },

        /** Remove event bindings, child views, and DOM elements.
         * Views that call 'addSubscription' are responsible for
         * calling 'removeSubscription'.
         */
        destroy: function() {
            this.$el.empty();
        }
    });

    return NotificationView;
});
