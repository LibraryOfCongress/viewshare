{% load viewshare_helpers %}
{% load embed_tags %}
{% load staticfiles %}

window.Freemix = window.Freemix || {};

window.Freemix.profile = {{ metadata|safe }};

window.Freemix.data = {{ data|safe }};

window.Freemix.title = "{{ title|linebreaksbr|safe }}";

window.Freemix.description = "{{ description|linebreaksbr|safe }}";

window.Freemix.permalink = "{{ permalink }}";

window.Freemix.home = "{% site_url %}";

window.Freemix.homeName = "{{ SITE_NAME }}";

window.Freemix.prefix = "{% site_url '' %}";

window.Freemix.staticUrl = window.Freemix.prefix + "{{STATIC_URL}}";

var FreemixEmbed = {};

FreemixEmbed.insert = function(tag, type, attrs) {
    var ans = document.createElement(tag);
    ans.setAttribute('type', type);
    for (var attr in attrs) {
        ans.setAttribute(attr, attrs[attr]);
    }
    document.getElementsByTagName('head')[0].appendChild(ans);
};

FreemixEmbed.insertStyle = function(src) {
    FreemixEmbed.insert(
        'link',
        'text/css',
        { 'rel': 'stylesheet', 'href': src }
    );
};

var requireconfig = {
    "config": {
        "exhibit": {
            "prefix": "{% site_url '' %}{{STATIC_URL}}simile/exhibit",
            "bundle": true,
            "autoCreate": false
        },
        "timeline": {
            "prefix": "{% site_url '' %}{{STATIC_URL}}simile/timeline/",
            "ajax": "{% site_url '' %}{{STATIC_URL}}simile/ajax/",
            "bundle": true
        },
        "ajax": {
            "history": false
        },
        "ext/time/time-extension": {
            "bundle": true,
            "prefix": "{% site_url '' %}{{STATIC_URL}}simile/exhibit/extensions/time/"
        },
        "ext/map/map-extension": {
            "bundle": true,
            "prefix": "{% site_url '' %}{{STATIC_URL}}simile/exhibit/extensions/map/"
        },
        "ext/openlayers/openlayers-extension": {
            "bundle": true,
            "prefix": "{% site_url '' %}{{STATIC_URL}}simile/exhibit/extensions/openlayers/"
        },
        "ext/flot/flot-extension": {
            "bundle": true,
            "prefix": "{% site_url '' %}{{STATIC_URL}}simile/exhibit/extensions/flot/"
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
};

(function() {
    FreemixEmbed.insert('script', 'text/javascript', {% require_module 'embed-main' %});
    FreemixEmbed.insertStyle("{% site_url '' %}{% static 'freemix/css/embed.css' %}");
}());
