require.config({
  paths: {
    apps: './dataset/js/apps',
    bootstrap: './freemix/js/lib/bootstrap',
    freemix: './freemix/js/freemix',
    'freemix.property': './freemix/js/property',
    'freemix.identify': './freemix/js/identify',
    handlebars: './freemix/js/lib/handlebars',
    jquery: './freemix/js/lib/jquery',
    models: './dataset/js/models/editor',
    observer: './dataset/js/observer',
    templates: './dataset/js/templates/editor',
    text: './freemix/js/lib/text',
    views: './dataset/js/views/editor'
  },
  shim: {
    handlebars: {
      exports: 'Handlebars'
    },
    freemix: {
      exports: 'Freemix'
    },
    'freemix.property': ['freemix'],
    'freemix.identify': ['freemix']
  }
});

require(['apps/editor-app'], function (app) {
  'use strict';
  app();
});
