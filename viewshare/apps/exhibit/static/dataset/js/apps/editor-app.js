/*global define */
define(
    [
        'jquery',
        'models/property-collection',
        'views/editor-view',
        'views/modal-augment-view',
        'views/notification-view'
    ], function (
        $,
        PropertyCollection,
        EditorView,
        ModalAugmentView,
        NotificationView
    ) {
    'use strict';
    var demo = function() {
        var data_url = $("link[rel='exhibit/data']").attr("href");
        var prop_url = $("link[rel='freemix/property_list']").attr("href");
        var properties = new PropertyCollection({
            dataURL: data_url,
            propertiesURL: prop_url
        });
        var notificationView = new NotificationView({$el: $('#notifications')});
        var editor = new EditorView({
            model: properties,
            $el: $('#editor')
        });
        var augmentModal = new ModalAugmentView({
            model: properties
        });
        // set up notifications
        notificationView.addSubscription(
            properties,
            'loadFailure',
            'error',
            'There was a server error while loading the data. Please try again later.',
            'Data Error!'
        );
        notificationView.addSubscription(
            properties,
            'augmentFailure',
            'error',
            'There was a server error during the data augmentation. Please try again later.',
            'Augmentation Error!'
        );
        properties.Observer('loadSuccess').subscribe(function() {
            // set up notificationView's PropertyModel subscriptions
            var i;
            for (i = 0; i < properties.properties.length; ++i) {
                addPropertyNotifications(
                    notificationView, properties.properties[i]);
            }
        });
        properties.Observer('newProperty').subscribe(function(newProperty) {
            addPropertyNotifications(notificationView, newProperty);
        });
        properties.load();
    };

    var addPropertyNotifications = function(notificationView, property) {
        notificationView.addSubscription(
            property,
            'updatePropertySuccess',
            'success',
            'Your change has been saved to a draft on the server.',
            'Data saved successfully!');
        notificationView.addSubscription(
            property,
            'updatePropertyError',
            'error',
            'Changes you made were not able to save to the server.',
            'There was a problem!');
    };

    return demo;
});

