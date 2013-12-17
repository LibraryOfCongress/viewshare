/*global define */
define(
    [
        'jquery',
        'models/augmentation-support-issue',
        'models/property-collection',
        'views/augmentation-support-issue-view',
        'views/editor-view',
        'views/modal-augment-view',
        'views/notification-view'
    ], function (
        $,
        AugmentationSupportIssue,
        PropertyCollection,
        AugmentationSupportIssueView,
        EditorView,
        ModalAugmentView,
        NotificationView
    ) {
    'use strict';
    var demo = function() {
        var dataURL = $("link[rel='exhibit/data']").attr("href");
        var propURL = $("link[rel='freemix/property_list']").attr("href");
        var exhibitSlug = $("link[rel='exhibit/slug']").attr("href");
        var properties = new PropertyCollection({
            dataURL: dataURL,
            propertiesURL: propURL});
        var notificationView = new NotificationView({$el: $('#notifications')});
        var editor = new EditorView({
            model: properties,
            $el: $('#editor')});
        var augmentModal = new ModalAugmentView({model: properties});
        var augmentationError = new AugmentationSupportIssue({
            email: '',
            exhibitSlug: exhibitSlug
        });
        properties.Observer('augmentDataFailure').subscribe(
            augmentationError.augmentDataFailureHandler.bind(augmentationError)
        );
        var augmentationErrorView = new AugmentationSupportIssueView({
            $el: undefined,
            model: augmentationError
        });
        // set up notifications
        notificationView.addSubscription(
            properties,
            'loadFailure',
            'error',
            'There was a server error while loading the data. Please try again later.',
            'Data Error!');
        notificationView.addSubscription(
            properties,
            'augmentDataFailure',
            'error',
            augmentationErrorView,
            'Augmentation Error!',
            false);
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

