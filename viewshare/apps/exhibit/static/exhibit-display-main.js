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
        "exhibit/js/lib/creole": {
            "exports": "Parse"
        },
        "openlayers": {
            "exports": "OpenLayers"
        }
    }
});

require(["simile/exhibit/exhibit-api"], function() {
    require([
        "jquery",
        "exhibit",
        "freemix/js/freemix",
        "freemix/js/patch_exhibit",
        "freemix/js/exhibit_utilities",
        "freemix/js/lib/lightbox",
        "exhibit/js/lenses/registry",
        "exhibit/js/views/registry",
        "exhibit/js/facets/registry",

        "exhibit/js/lenses/list",
        "exhibit/js/lenses/thumbnail",
        "exhibit/js/views/list",
        "exhibit/js/views/map",
        "exhibit/js/views/piechart",
        "exhibit/js/views/scatterplot",
        "exhibit/js/views/table",
        "exhibit/js/views/timeline",
        "exhibit/js/views/thumbnail",

        "exhibit/js/facets/search",
        "exhibit/js/facets/list",
        "exhibit/js/facets/tagcloud",
        "exhibit/js/facets/slider",
        "exhibit/js/facets/numeric",
        "exhibit/js/facets/logo",
        "exhibit/js/lib/creole",
        "exhibit/js/facets/text",
        "exhibit/js/display"
    ], function($, Exhibit, Freemix) {
        $(document).ready(function() {
            Freemix.initialize();
        });
    });
});
