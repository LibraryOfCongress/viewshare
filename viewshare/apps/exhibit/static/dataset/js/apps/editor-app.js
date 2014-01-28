/*global define */
define([
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
        var dataURL = $('link[rel="exhibit-data"]').attr('href');
        var propURL = $('link[rel="freemix/property_list"]').attr('href');
        var editorURL = window.location.href;
        var properties = new PropertyCollection({
            dataURL: dataURL,
            propertiesURL: propURL
        });
        var notificationView = new NotificationView({$el: $('#notifications')});
        var augmentationError = new AugmentationSupportIssue({
            email: '',
            editorURL: editorURL
        });
        new EditorView({
            model: properties,
            $el: $('#editor')
        });
        new ModalAugmentView({model: properties});
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
            'There was a server error while loading the data. ' +
                'Please try again later.',
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
            'Changes to "' + property.label +
                '" have been saved to the server.',
            'Data saved successfully!');
        notificationView.addSubscription(
            property,
            'updatePropertyError',
            'error',
            'Changes to "' + property.label +
                '" were not able to be saved. Please try again later.',
            'We are experiencing service issues.');
        notificationView.addSubscription(
            property,
            'deletePropertySuccess',
            'success',
            '"' + property.label + '" has been deleted.',
            'Property deleted successfully!');
        notificationView.addSubscription(
            property,
            'deletePropertyError',
            'error',
            'Changes to "' + property.label +
                '" were not able to be saved. Please try again later.',
            'We are experiencing service issues.');
    };

    return demo;
});

