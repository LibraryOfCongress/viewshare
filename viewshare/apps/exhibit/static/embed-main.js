
requirejs.config({
    "baseUrl": "/static/",
    "config": {
        "exhibit": {
	    "prefix": "http://viewshare.org/static/simile/exhibit",
            "bundle": true,
            "autoCreate": false
        },
        "timeline": {
            "prefix": "http://viewshare.org/static/simile/timeline/",
            "ajax": "http://viewshare.org/static/simile/ajax/",
            "bundle": true
        },
        "ajax": {
            "history": false
        },
        "ext/time/time-extension": {
            "bundle": true,
            "prefix": "http://viewshare.org/static/simile/exhibit/extensions/time/"
        },
        "ext/map/map-extension": {
            "bundle": true,
            "prefix": "http://viewshare.org/static/simile/exhibit/extensions/map/"
        },
        "ext/openlayers/openlayers-extension": {
            "bundle": true,
            "prefix": "http://viewshare.org/static/simile/exhibit/extensions/openlayers/"
        },
        "ext/flot/flot-extension": {
            "bundle": true,
            "prefix": "http://viewshare.org/static/simile/exhibit/extensions/flot/"
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
        "creole": "freemix/js/lib/creole",
        "openlayers": "simile/exhibit/extensions/openlayers/lib/OpenLayers",
        "text": 'freemix/js/lib/text',
        "display": "freemix/js/display"
    },
    "map": {
        "*": {
            "lib/jquery": "jquery"
        }
    },
    "shim": {
        "jquery": {
            "exports": "jQuery"
        },
        "creole": {
            "exports": "Parse"
        },
        "openlayers": {
            "exports": "OpenLayers"
        },
        "lib/jquery": {
            "exports": "jQuery"
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
        }
    }
});

require([
        "jquery",
        "freemix/js/embed/display",
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
        "display/facets/text"
    ], function($, initialize) {
	$.noConflict(true);
        $(document).trigger("scriptsLoaded.exhibit");
	var randTmpId = "freemix-embed-shell-" + Math.round(Math.random()*1000);
	$("#freemix-embed").after('<div id="' + randTmpId + '" class="freemix-embed-shell"><div id="canvas" class="freemix-themeable container-fluid"><div><h1 title="Title">' + window.Freemix.title + '</h1><h2 title="Subtitle">' + window.Freemix.description + '</h2></div></div></div>');
	$("#" + randTmpId).append('<div class="embed-watermark">See the <a href="' + window.Freemix.permalink + '">original Exhibit</a>, created with and hosted by <a href="' + window.Freemix.home + '">' + window.Freemix.homeName + '</a>.</div>');
        initialize(".freemix-embed-shell #canvas");
    }
);
