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
        "freemix/js/display",
        "freemix/js/patch_exhibit",

        "freemix/js/lenses/list",
        "freemix/js/lenses/thumbnail",
        "freemix/js/views/list",
        "freemix/js/views/map",
        "freemix/js/views/piechart",
        "freemix/js/views/barchart",
        "freemix/js/views/scatterplot",
        "freemix/js/views/table",
        "freemix/js/views/timeline",
        "freemix/js/views/thumbnail",

        "freemix/js/facets/search",
        "freemix/js/facets/list",
        "freemix/js/facets/tagcloud",
        "freemix/js/facets/slider",
        "freemix/js/facets/numeric",
        "freemix/js/facets/logo",
        "freemix/js/lib/creole",
        "freemix/js/facets/text",
    ], function(initialize) {
        initialize();
    });
});
