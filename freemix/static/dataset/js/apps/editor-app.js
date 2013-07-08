/*global define */
define(
  [
    'jquery',
    'models/record-collection',
    'views/editor-view',
    'views/notification-view'
  ], function (
    $,
    RecordCollection,
    EditorView,
    NotificationView
  ) {
  'use strict';
  var demo = function() {
    var profileURL = $("link[rel='freemix/dataprofile']").attr("href"),
    dataURL = $("link[rel='exhibit/data']").attr("href"),
    refreshURL = $("link[rel='datasource/refresh']").attr("href"),
    saveURL = $("#save_button").attr("href"),
    records = new RecordCollection({
      profileURL: profileURL,
      dataURL: dataURL,
      refreshURL: refreshURL,
      saveURL: saveURL
    }),
    notificationView = new NotificationView({$el: $('#notifications')}),
    editor = new EditorView({
      model: records,
      $el: $('#editor'),
      notificationView: notificationView
    });
    records.load();
  };

  return demo;
});
