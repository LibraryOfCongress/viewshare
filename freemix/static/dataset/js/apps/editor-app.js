/*global define */
define(['views/editor-view', 'jquery', 'models/record-collection', 'urls'],
       function (EditorView, $, RecordCollection, urls) {
  'use strict';
  var demo = function() {
    var records = new RecordCollection({
      profileURL: urls.profile,
      dataURL: urls.data
    }),
    editor = new EditorView({
      model: records,
      $el: $('#editor')
    });
    records.sync();
  };

  return demo;
});
