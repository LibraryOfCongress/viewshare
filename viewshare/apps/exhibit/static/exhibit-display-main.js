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
        "openlayers": "simile/exhibit/extensions/openlayers/lib/OpenLayers"
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
        "freemix/js/lib/creole": {
            "exports": "Parse"
        },
        "openlayers": {
            "exports": "OpenLayers"
        }
    }
});

require(["simile/exhibit/exhibit-api"], function() {
    require([
        "freemix/js/display/display",
        "freemix/js/patch_exhibit",

        "freemix/js/display/lenses/list",
        "freemix/js/display/lenses/thumbnail",
        "freemix/js/display/views/list",
        "freemix/js/display/views/map",
        "freemix/js/display/views/piechart",
        "freemix/js/display/views/barchart",
        "freemix/js/display/views/scatterplot",
        "freemix/js/display/views/table",
        "freemix/js/display/views/timeline",
        "freemix/js/display/views/thumbnail",

        "freemix/js/display/facets/search",
        "freemix/js/display/facets/list",
        "freemix/js/display/facets/tagcloud",
        "freemix/js/display/facets/slider",
        "freemix/js/display/facets/numeric",
        "freemix/js/display/facets/logo",
        "freemix/js/lib/creole",
        "freemix/js/display/facets/text",
    ], function(initialize) {
        initialize();
    });
});
