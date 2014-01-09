
requirejs.config({
    "baseUrl": "/static/",
    "config": {
        "exhibit": {
            "prefix": "/static/simile/exhibit/",
            "bundle": true,
            "autoCreate": false
        },
        "timeline": {
            "prefix": "/static/simile/timeline/",
            "ajax": "/static/simile/ajax/",
            "bundle": true
        },
        "ajax": {
            "history": false
        },
        "ext/time/time-extension": {
            "bundle": true,
            "prefix": "/static/simile/exhibit/extensions/time/"
        },
        "ext/map/map-extension": {
            "bundle": true,
            "prefix": "/static/simile/exhibit/extensions/map/"
        },
        "ext/openlayers/openlayers-extension": {
            "bundle": true,
            "prefix": "/static/simile/exhibit/extensions/openlayers/"
        },
        "ext/flot/flot-extension": {
            "bundle": true,
            "prefix": "/static/simile/exhibit/extensions/flot/"
        }
    },
    "paths": {
        "async": "lib/async",
        "i18n": "lib/i18n",
        "ext": "extensions",
        "exlib": "lib",
        "openlayers": "simile/exhibit/extensions/openlayers/lib/OpenLayers",
        "text": 'freemix/js/lib/text',
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
        "jquery",
        "display/display",
        "freemix/js/patch_exhibit",

        "display/lenses/list",
        "display/lenses/thumbnail",
        "display/views/list",
        "display/views/map",
        "display/views/piechart",
        "display/views/barchart",
        "display/views/scatterplot",
        "display/views/table",
        "display/views/timeline",
        "display/views/thumbnail",

        "display/facets/search",
        "display/facets/list",
        "display/facets/tagcloud",
        "display/facets/slider",
        "display/facets/numeric",
        "display/facets/logo",
        "display/facets/text",
    ], function($, initialize) {
        $(document).trigger("scriptsLoaded.exhibit");
        initialize();
    });
});
