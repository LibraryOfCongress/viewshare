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
        "jquery.json": "freemix/js/lib/jquery.json"


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
        }
    }
});

require(["simile/exhibit/exhibit-api"], function() {
    require([
        "jquery",
        "exhibit",
        "freemix/js/editor/patch_exhibit",
        "freemix/js/editor",
        "freemix/js/patch_exhibit",

        "freemix/js/editor/widget",
        "freemix/js/editor/facets/container",
        "freemix/js/editor/views/container",
        "freemix/js/editor/facets/base",
        "freemix/js/editor/views/base",
        "freemix/js/editor/lenses/base",

        "freemix/js/editor/lenses/list",
        "freemix/js/editor/lenses/thumbnail",
        "freemix/js/editor/views/list",
        "freemix/js/editor/views/map",
        "freemix/js/editor/views/piechart",
        "freemix/js/editor/views/barchart",
        "freemix/js/editor/views/scatterplot",
        "freemix/js/editor/views/table",
        "freemix/js/editor/views/timeline",
        "freemix/js/editor/views/thumbnail",

        "freemix/js/editor/facets/search",
        "freemix/js/editor/facets/list",
        "freemix/js/editor/facets/tagcloud",
        "freemix/js/editor/facets/slider",
        "freemix/js/editor/facets/numeric",
        "freemix/js/editor/facets/logo",
        "freemix/js/lib/creole",
        "freemix/js/editor/facets/text",
        "jquery-ui",
        "jquery.csrf",
        "jquery.form",
        "jquery.uuid",
        "jquery.json"
    ], function($, Exhibit, _, initialize) {
        initialize();
    });
});
