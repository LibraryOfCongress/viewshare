var _base = "/static/";

requirejs.config({
    "baseUrl": _base,
//    "urlArgs": "bust=" + new Date().valueOf(),
    "config": {
        "exhibit": {
            "prefix": _base + "simile/exhibit/",
            "bundle": true,
            "autoCreate": false
        },
        "timeline": {
            "prefix": _base + "simile/timeline/",
            "ajax": _base + "simile/ajax/",
            "bundle": true
        },
        "ajax": {
            "history": false
        },
        "ext/time/time-extension": {
            "bundle": true,
            "prefix": _base + "simile/exhibit/extensions/time/"
        },
        "ext/map/map-extension": {
            "bundle": true,
            "prefix": _base + "simile/exhibit/extensions/map/"
        },
        "ext/openlayers/openlayers-extension": {
            "bundle": true,
            "prefix": _base + "simile/exhibit/extensions/openlayers/"
        },
        "ext/flot/flot-extension": {
            "bundle": true,
            "prefix": _base + "simile/exhibit/extensions/flot/"
        }
    },
    "paths": {
        "async": "lib/async",
        "i18n": "lib/i18n",
        "ext": "extensions",
        "exlib": "lib",
        "fmlib": "freemix/js/lib",
        "fmexlib": "freemix/js/lib",
        "openlayers": "simile/exhibit/extensions/openlayers/lib/OpenLayers",
        "jquery-ui": "freemix/js/lib/jquery-ui",
        "ui.multiselect": "freemix/js/lib/ui.multiselect",
        "bootstrap": "freemix/js/lib/bootstrap",
//        "jquery": 'freemix/js/lib/jquery',
        "jquery.cookie": "freemix/js/lib/jquery.cookie",
        "jquery.csrf": "freemix/js/lib/jquery.csrf",
        "jquery.highlight": "freemix/js/lib/jquery.highlight",
        "jquery.form": "freemix/js/lib/jquery.form",
        "jquery.uuid": "freemix/js/lib/jquery.uuid",
        "jquery.json": "freemix/js/lib/jquery.json",
        "text": 'freemix/js/lib/text',
        "handlebars": "freemix/js/lib/handlebars",
        "templates": "freemix/js/templates",
        "models": "freemix/js/models",
        "layout": "freemix/js/layout",
        "display": "freemix/js/display"



    },
    "shim": {
        "exlib/jquery": {
            "exports": "jQuery"
        },
        "exlib/json2": {
            "exports": "JSON"
        },
        "exlib/base64": {
            "exports": "Base64"
        },
        "exlib/jquery.history": {
            "deps": ["exlib/jquery"],
            "exports": "History"
        },
        "exlib/jquery.history.shim": {
            "deps": ["exlib/jquery.history"]
        },
        "exlib/jquery.nouislider": {
            "deps": ["exlib/jquery"]
        },
        "ext/openlayers/lib/openlayers": {
            "exports": "OpenLayers"
        },
        "freemix/js/lib/jquery": {
            "exports": "jQuery"
        },
        "jquery-ui": {
            "deps": ["jquery"]
        },
        "ui.multiselect": {
            "deps": ["jquery-ui"]
        },
        "freemix/js/lib/creole": {
            "exports": "Parse"
        },
        "openlayers": {
            "exports": "OpenLayers"
        },
        "bootstrap": {
            "deps": ["jquery"]
        },
        "jquery.cookie": {
            "deps": ["jquery"]
        },
        "jquery.highlight": {
            "deps": ["jquery"]
        },
        "jquery.csrf": {
            "deps": ["jquery", "jquery.cookie"]
        },
        "jquery.form": {
            "deps": ["jquery"]
        },
        "jquery.uuid": {
            "deps": ["jquery"]
        },
        "jquery.json": {
            "deps": ["jquery"]
        },
        "handlebars": {
            "exports": "Handlebars"
        }
    }
});

require(["simile/exhibit/exhibit-api"], function() {
    require([
        "layout/editor",
        "layout/patch_exhibit",
        "freemix/js/patch_exhibit",

        "layout/widget",
        "layout/facets/container",
        "layout/views/container",
        "layout/facets/base",
        "layout/views/base",
        "layout/lenses/base",

        "layout/lenses/list",
        "layout/lenses/thumbnail",
        "layout/views/list",
        "layout/views/map",
        "layout/views/piechart",
        "layout/views/barchart",
        "layout/views/scatterplot",
        "layout/views/table",
        "layout/views/timeline",
        "layout/views/thumbnail",

        "layout/facets/search",
        "layout/facets/list",
        "layout/facets/tagcloud",
        "layout/facets/slider",
        "layout/facets/numeric",
        "layout/facets/logo",
        "layout/facets/text",
        "jquery.form",
        "jquery.uuid",
        "jquery.json"
    ], function(initialize) {
        initialize();
    });
});
