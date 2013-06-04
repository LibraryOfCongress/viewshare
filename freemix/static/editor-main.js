require.config({
  paths: {
    handlebars: './freemix/js/lib/handlebars',
    jquery: './freemix/js/lib/jquery',
    models: 'models/editor',
    observer: './freemix/js/observer',
    templates: './freemix/js/templates/editor',
    text: './freemix/js/lib/text',
    views: './freemix/js/views/editor'
  },
  shim: {
    handlebars: {
      exports: 'Handlebars'
    }
  }
});

require([], function () {
    'use strict';
  });
