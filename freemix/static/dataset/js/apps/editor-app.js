/*global define */
define(['views/editor-view', 'jquery', 'models/record-collection'],
       function (EditorView, $, RecordCollection) {
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
    editor = new EditorView({
      model: records,
      $el: $('#editor')
    });
    records.load();
  };

  return demo;
});
