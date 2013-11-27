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
        "fmexlib": "exhibit/js/lib",
        "openlayers": "simile/exhibit/extensions/openlayers/lib/OpenLayers",
        "jquery-ui": "freemix/js/lib/jquery-ui",
        "ui.multiselect": "freemix/js/lib/ui.multiselect",
        "bootstrap": "freemix/js/lib/bootstrap",
        "jquery": 'freemix/js/lib/jquery',
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
        "exhibit/js/lib/creole": {
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
        "exhibit/js/editor/patch_exhibit",
        "exhibit/js/editor",
        "freemix/js/patch_exhibit",

        "exhibit/js/editor/widget",
        "exhibit/js/editor/facets/container",
        "exhibit/js/editor/views/container",
        "exhibit/js/editor/facets/base",
        "exhibit/js/editor/views/base",
        "exhibit/js/editor/lenses/base",

        "exhibit/js/editor/lenses/list",
        "exhibit/js/editor/lenses/thumbnail",
        "exhibit/js/editor/views/list",
        "exhibit/js/editor/views/map",
        "exhibit/js/editor/views/piechart",
        "exhibit/js/editor/views/scatterplot",
        "exhibit/js/editor/views/table",
        "exhibit/js/editor/views/timeline",
        "exhibit/js/editor/views/thumbnail",

        "exhibit/js/editor/facets/search",
        "exhibit/js/editor/facets/list",
        "exhibit/js/editor/facets/tagcloud",
        "exhibit/js/editor/facets/slider",
        "exhibit/js/editor/facets/numeric",
        "exhibit/js/editor/facets/logo",
        "exhibit/js/lib/creole",
        "exhibit/js/editor/facets/text",
        "jquery-ui",
        "jquery.csrf",
        "jquery.form",
        "jquery.uuid",
        "jquery.json"
    ], function($, Exhibit, _, initialize) {
        initialize();
    });
});
