
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
    "deps": ["nls/de/locale","nls/es/locale","nls/fr/locale","nls/locale","nls/nl/locale","nls/no/locale","nls/pt-br/locale","nls/root/locale","nls/sv/locale","ext/flot/nls/locale","ext/flot/nls/root/locale","ext/map/nls/de/locale","ext/map/nls/es/locale","ext/map/nls/fr/locale","ext/map/nls/locale","ext/map/nls/nl/locale","ext/map/nls/root/locale","ext/map/nls/sv/locale","ext/time/nls/de/locale","ext/time/nls/es/locale","ext/time/nls/fr/locale","ext/time/nls/locale","ext/time/nls/nl/locale","ext/time/nls/root/locale","ext/time/nls/sv/locale"],
    "paths": {
        "i18n": "simile/exhibit/lib/i18n",
        "async": "simile/exhibit/lib/async",
        "lib": "simile/exhibit/lib",
        "nls": "simile/exhibit/nls",
        "ext": "simile/exhibit/extensions",
        "scripts": "simile/exhibit/scripts",
        "exhibit": "simile/exhibit/exhibit",
        "timeline": "simile/exhibit/ext/timeline/api/timeline-bundle",
        "simile-ajax": "simile/exhibit/ext/ajax/api/simile-ajax-bundle",
        "jquery": "freemix/js/lib/jquery",
        "openlayers": "simile/exhibit/extensions/openlayers/lib/OpenLayers",
        "jquery-ui": "freemix/js/lib/jquery-ui",
        "multiselect": "freemix/js/lib/multiselect",
        "bootstrap": "freemix/js/lib/bootstrap",
        "jquery.cookie": "freemix/js/lib/jquery.cookie",
        "jquery.csrf": "freemix/js/lib/jquery.csrf",
        "jquery.highlight": "freemix/js/lib/jquery.highlight",
        "jquery.form": "freemix/js/lib/jquery.form",
        "jquery.uuid": "freemix/js/lib/jquery.uuid",
        "jquery.json": "freemix/js/lib/jquery.json",
        "jquery-sortable": "freemix/js/lib/jquery-sortable",
        "text": 'freemix/js/lib/text',
        "handlebars": "freemix/js/lib/handlebars",
        "creole": "freemix/js/lib/creole",
        "templates": "freemix/js/templates",
        "layout": "freemix/js/layout",
        "display": "freemix/js/display",
        "models": "dataset/js/models/editor",
        "observer": "dataset/js/observer"
    },
    "map": {
        "*": {
            "lib/jquery": "jquery"
        }
    },
    "shim": {
        "openlayers": {
            "exports": "OpenLayers"
        },
        "jquery": {
            "exports": "jQuery"
        },
        "jquery-ui": {
            "deps": ["jquery"]
        },
        "multiselect": {
            "deps": ["jquery", "bootstrap"]
        },
        "creole": {
            "exports": "Parse"
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
        },
        "lib/base64": {
            "exports": "Base64"
        },
        "lib/jquery": {
            "exports": "jQuery"
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
        }
    }
});

require(["jquery",
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
    ], function($,initialize) {
        $(document).trigger("scriptsLoaded.exhibit");
        initialize();
    }
);
