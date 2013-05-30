require.config({
  paths: {
    handlebars: './lib/handlebars',
    jquery: './lib/jquery',
    models: 'models/editor',
    observer: 'observer',
    templates: 'templates/editor',
    text: '.lib/text',
    views: 'views/editor'
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
