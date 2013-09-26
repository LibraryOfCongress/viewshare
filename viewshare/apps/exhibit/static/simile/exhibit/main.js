// temporary placeholder, should be wrapped into a larger freemix require
// configuration

requirejs.config({
    "baseUrl": "/static/simile/exhibit/",
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
            "prefix": "/static/exhibit/extensions/flot/"
        }
    },
    "paths": {
        "async": "lib/async",
        "i18n": "lib/i18n"
    },
    "shim": {
        "lib/jquery": {
            "exports": "jQuery"
        },
        "lib/json2": {
            "exports": "JSON"
        },
        "lib/base64": {
            "exports": "Base64"
        },
        "lib/jquery.history": {
            "deps": ["lib/jquery"],
            "exports": "History"
        },
        "lib/jquery.history.shim": {
            "deps": ["lib/jquery.history"]
        },
        "lib/jquery.nouislider": {
            "deps": ["lib/jquery"]
        },
        "openlayers": {
            "exports": "OpenLayers"
        }
    }
});

require(["exhibit-omni"], function() {
    require(["exhibit"], function(Exhibit) {
        
    });
});
