/*global define */
define(
  [
    'jquery',
    'models/property-collection',
    'views/editor-view',
    'views/notification-view'
  ], function (
    $,
    PropertyCollection,
    EditorView,
    NotificationView
  ) {
  'use strict';
  var demo = function() {
    // TODO: Render 'owner' and 'slug' in template on server
    var owner = $("link[rel='freemix/dataprofile']").attr("href"),
    slug = $("link[rel='exhibit/data']").attr("href"),
    properties = new PropertyCollection({
      owner: owner,
      slug: slug
    }),
    notificationView = new NotificationView({$el: $('#notifications')}),
    editor = new EditorView({
      model: properties,
      $el: $('#editor'),
    });
    properties.Observer('loadSuccess').subscribe(function() {
      // set up notificationView's subscriptions
      var i;
      for (i = 0; i < properties.properties.length; ++i) {
        notificationView.addSubscription(
          properties.properties[i],
          'updatePropertySuccess',
          'success',
          'Your change has been saved to a draft on the server.',
          'Data saved successfully!');
        notificationView.addSubscription(
          properties.properties[i],
          'updatePropertyError',
          'error',
          'Changes you made were not able to save to the server.',
          'There was a problem!');
      }
    });
    properties.load();
  };

  return demo;
});
