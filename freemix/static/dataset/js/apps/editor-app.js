/*global define */
define(['views/editor-view', 'jquery', 'models/record-collection'],
       function (EditorView, $, RecordCollection) {
  'use strict';
  var demo = function() {
    var profileURL = $("link[rel='freemix/dataprofile']").attr("href"),
    dataURL = $("link[rel='exhibit/data']").attr("href"),
    records = new RecordCollection({
      profileURL: profileURL,
      dataURL: dataURL
    }),
    editor = new EditorView({
      model: records,
      $el: $('#editor')
    });
    records.sync();
  };

  return demo;
});
