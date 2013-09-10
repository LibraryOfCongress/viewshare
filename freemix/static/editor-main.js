require.config({
  paths: {
    apps: './dataset/js/apps',
    bootstrap: './freemix/js/lib/bootstrap',
    handlebars: './freemix/js/lib/handlebars',
    jquery: './freemix/js/lib/jquery',
    'jquery.cookie': './freemix/js/lib/jquery.cookie',
    'jquery.csrf': './freemix/js/lib/jquery.csrf',
    models: './dataset/js/models/editor',
    observer: './dataset/js/observer',
    templates: './dataset/js/templates/editor',
    text: './freemix/js/lib/text',
    views: './dataset/js/views/editor'
  },
  shim: {
    bootstrap: ['jquery'],
    handlebars: {
      exports: 'Handlebars'
    },
    'jquery.cookie': ['jquery'],
    'jquery.csrf': ['jquery', 'jquery.cookie']
  }
});

require(['apps/editor-app'], function (app) {
  'use strict';
  app();
});
