/*==================================================
 *  Simile Ajax API
 *==================================================
 */

/*==================================================
 *  REMEMBER to update the Version!  Now found in scripts/base.js
 *==================================================
 */

define([
    "module",
    "./scripts/simile-ajax-base",
    "./scripts/platform",
    "./scripts/debug",
    "./scripts/xmlhttp",
    "./scripts/dom",
    "./scripts/bubble",
    "./scripts/date-time",
    "./scripts/string",
    "./scripts/html",
    "./scripts/set",
    "./scripts/sorted-array",
    "./scripts/event-index",
    "./scripts/units",
    "./scripts/ajax",
    "./scripts/history",
    "./scripts/window-manager"
], function(module, SimileAjax, Platform, Debug, XmlHttp, DOM, Graphics, DateTime, StringUtils, HTML, Set, SortedArray, EventIndex, NativeDateUnit, ListenerQueue, SAHistory, WindowManager) { 
    SimileAjax.Platform = Platform;
    SimileAjax.Debug = Debug;
    SimileAjax.XmlHttp = XmlHttp;
    SimileAjax.DOM = DOM;
    SimileAjax.Graphics = Graphics;
    SimileAjax.DateTime = DateTime;
    SimileAjax.StringUtils = StringUtils;
    SimileAjax.HTML = HTML;
    SimileAjax.Set = Set;
    SimileAjax.SortedArray = SortedArray;
    SimileAjax.EventIndex = EventIndex;
    SimileAjax.NativeDateUnit = NativeDateUnit;
    SimileAjax.ListenerQueue = ListenerQueue;
    SimileAjax.History = SAHistory;
    SimileAjax.WindowManager = WindowManager;

    var getHead = function(doc) {
        return doc.getElementsByTagName("head")[0];
    };
    
    SimileAjax.findScript = function(doc, substring) {
        var scripts, s, url, i;
	    scripts = doc.documentElement.getElementsByTagName("script");
	    for (s = 0; s < scripts.length; s++) {
            url = scripts[s].src;
            i = url.indexOf(substring);
            if (i >= 0) {
                return url;
            }
	    }
        return null;
    };

    /**
     * Parse out the query parameters from a URL
     * @param {String} url    the url to parse, or location.href if undefined
     * @param {Object} to     optional object to extend with the parameters
     * @param {Object} types  optional object mapping keys to value types
     *        (String, Number, Boolean or Array, String by default)
     * @return a key/value Object whose keys are the query parameter names
     * @type Object
     */
    SimileAjax.parseURLParameters = function(url, to, types) {
        to = to || {};
        types = types || {};
        
        if (typeof url == "undefined") {
            url = location.href;
        }
        var q = url.indexOf("?");
        if (q < 0) {
            return to;
        }
        url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
        
        var params = url.split("&"), param, parsed = {};
        var decode = window.decodeURIComponent || unescape;
        for (var i = 0; param = params[i]; i++) {
            var eq = param.indexOf("=");
            var name = decode(param.slice(0,eq));
            var old = parsed[name];
            var replacement = decode(param.slice(eq+1));
            
            if (typeof old == "undefined") {
                old = [];
            } else if (!(old instanceof Array)) {
                old = [old];
            }
            parsed[name] = old.concat(replacement);
        }
        for (var i in parsed) {
            if (!parsed.hasOwnProperty(i)) continue;
            var type = types[i] || String;
            var data = parsed[i];
            if (!(data instanceof Array)) {
                data = [data];
            }
            if (type === Boolean && data[0] == "false") {
                to[i] = false; // because Boolean("false") === true
            } else {
                to[i] = type.apply(this, data);
            }
        }
        return to;
    };

    /**
     * @deprecated Use RequireJS loading mechanisms instead.
     */
    SimileAjax.includeJavascriptFile = function(doc, url, onerror, charset, callback) {
        SimileAjax.Debug.warn("Loading scripts is no longer a feature of SimileAjax. Use RequireJS instead.");
        return;
    };

    /**
     * @deprecated Use RequireJS loading mechanisms instead.
     */
    SimileAjax.includeJavascriptFiles = function(doc, urlPrefix, filenames) {
        SimileAjax.Debug.warn("Loading scripts is no longer a feature of SimileAjax. Use RequireJS instead.");
        return;
    };

    SimileAjax.includeCssFile = function(doc, url) {
        if (doc.body == null) {
            try {
                doc.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
                return;
            } catch (e) {
                // fall through
            }
        }
        
        var link = doc.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        getHead(doc).appendChild(link);
    };

    SimileAjax.includeCssFiles = function(doc, urlPrefix, filenames) {
        for (var i = 0; i < filenames.length; i++) {
            SimileAjax.includeCssFile(doc, urlPrefix + filenames[i]);
        }
    };
    
    /**
     * Append into urls each string in suffixes after prefixing it with urlPrefix.
     * @param {Array} urls
     * @param {String} urlPrefix
     * @param {Array} suffixes
     */
    SimileAjax.prefixURLs = function(urls, urlPrefix, suffixes) {
        for (var i = 0; i < suffixes.length; i++) {
            urls.push(urlPrefix + suffixes[i]);
        }
    };

    /**
     * A call to set the prefix and load CSS.
     * @param {String} prefix
     * @returns {Boolean}
     */
    SimileAjax.setPrefix = function(prefix) {
        if (SimileAjax.urlPrefix === null && prefix !== null) {
            if (prefix.substr(-1) !== "/") {
                prefix += "/";
            }
            SimileAjax.urlPrefix = prefix;
            SimileAjax.params.prefix = prefix;
            SimileAjax.loadCSS(SimileAjax.params.bundle);
            return true;
        };
        return false;
    };

    /**
     * Private call to load CSS.
     * @prefix {Boolean} bundle Whether to load bundled CSS or individual.
     */
    SimileAjax.loadCSS = function(bundle) {
        var cssFiles = ["main.css"], bundledCssFile = "simile-ajax-bundle.css";
        bundle = bundle || true;

        if (bundle) {
            SimileAjax.includeCssFile(document, SimileAjax.urlPrefix + "styles/" + bundledCssFile);
        } else {
            SimileAjax.includeCssFiles(document, SimileAjax.urlPrefix + "styles/", cssFiles);
        }
    };

    /**
     * Deal with legacy methods of passing configuration to SimileAjax.
     */
    SimileAjax.loadLegacy = function() {
        var prefix, url, targets, target, i;
 
        prefix = null;
        if (typeof SimileAjax_urlPrefix == "string") {
            prefix = SimileAjax_urlPrefix;
            SimileAjax.setPrefix(prefix);
        } else {
            url = null;
            targets = ["simile-ajax-api.js", "simile-ajax-bundle.js"];
            for (i = 0; i < targets.length; i++) {
                target = targets[i];
                url = SimileAjax.findScript(document, target);
                if (url != null) {
                    prefix = url.substr(0, url.indexOf(target));
                    break;
                }
            }
            
            if (url === null) {
                SimileAjax.error = new Error("Failed to derive URL prefix for SimileAjax");
            } else {
                SimileAjax.setPrefix(prefix);
                SimileAjax.params = SimileAjax.parseURLParameters(url, SimileAjax.params, SimileAjax.paramTypes);
            } 
        }
 
        SimileAjax.Graphics = Graphics.initialize(Graphics);
        SimileAjax.History.initialize();
        SimileAjax.WindowManager.initialize();
    };

    /**
     * Load based on RequireJS configuration.
     */
    SimileAjax.loadRequire = function() {
        var conf;

        conf = module.config();
        SimileAjax.params = conf;
        SimileAjax.setPrefix(SimileAjax.params.prefix);

        SimileAjax.Graphics = Graphics.initialize(Graphics);
        SimileAjax.History.initialize();
        SimileAjax.WindowManager.initialize();
    };

    SimileAjax.load = function() {
        if (SimileAjax.loaded) {
            return;
        } else {
            SimileAjax.loaded = true;
            if (module.config().hasOwnProperty("prefix")) {
                SimileAjax.loadRequire();
            } else {
                SimileAjax.loadLegacy();
            }
        }
    };

    return SimileAjax;
});
