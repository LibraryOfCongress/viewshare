{% load freemix_helpers %}

// Embed material follows LABjs definition, for loading scripts in a
// certain order
//
/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v2.0.3 (c) Kyle Simpson
    MIT License
*/
(function(o){var K=o.$LAB,y="UseLocalXHR",z="AlwaysPreserveOrder",u="AllowDuplicates",A="CacheBust",B="BasePath",C=/^[^?#]*\//.exec(location.href)[0],D=/^\w+\:\/\/\/?[^\/]+/.exec(C)[0],i=document.head||document.getElementsByTagName("head"),L=(o.opera&&Object.prototype.toString.call(o.opera)=="[object Opera]")||("MozAppearance"in document.documentElement.style),q=document.createElement("script"),E=typeof q.preload=="boolean",r=E||(q.readyState&&q.readyState=="uninitialized"),F=!r&&q.async===true,M=!r&&!F&&!L;function G(a){return Object.prototype.toString.call(a)=="[object Function]"}function H(a){return Object.prototype.toString.call(a)=="[object Array]"}function N(a,c){var b=/^\w+\:\/\//;if(/^\/\/\/?/.test(a)){a=location.protocol+a}else if(!b.test(a)&&a.charAt(0)!="/"){a=(c||"")+a}return b.test(a)?a:((a.charAt(0)=="/"?D:C)+a)}function s(a,c){for(var b in a){if(a.hasOwnProperty(b)){c[b]=a[b]}}return c}function O(a){var c=false;for(var b=0;b<a.scripts.length;b++){if(a.scripts[b].ready&&a.scripts[b].exec_trigger){c=true;a.scripts[b].exec_trigger();a.scripts[b].exec_trigger=null}}return c}function t(a,c,b,d){a.onload=a.onreadystatechange=function(){if((a.readyState&&a.readyState!="complete"&&a.readyState!="loaded")||c[b])return;a.onload=a.onreadystatechange=null;d()}}function I(a){a.ready=a.finished=true;for(var c=0;c<a.finished_listeners.length;c++){a.finished_listeners[c]()}a.ready_listeners=[];a.finished_listeners=[]}function P(d,f,e,g,h){setTimeout(function(){var a,c=f.real_src,b;if("item"in i){if(!i[0]){setTimeout(arguments.callee,25);return}i=i[0]}a=document.createElement("script");if(f.type)a.type=f.type;if(f.charset)a.charset=f.charset;if(h){if(r){e.elem=a;if(E){a.preload=true;a.onpreload=g}else{a.onreadystatechange=function(){if(a.readyState=="loaded")g()}}a.src=c}else if(h&&c.indexOf(D)==0&&d[y]){b=new XMLHttpRequest();b.onreadystatechange=function(){if(b.readyState==4){b.onreadystatechange=function(){};e.text=b.responseText+"\n//@ sourceURL="+c;g()}};b.open("GET",c);b.send()}else{a.type="text/cache-script";t(a,e,"ready",function(){i.removeChild(a);g()});a.src=c;i.insertBefore(a,i.firstChild)}}else if(F){a.async=false;t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}else{t(a,e,"finished",g);a.src=c;i.insertBefore(a,i.firstChild)}},0)}function J(){var l={},Q=r||M,n=[],p={},m;l[y]=true;l[z]=false;l[u]=false;l[A]=false;l[B]="";function R(a,c,b){var d;function f(){if(d!=null){d=null;I(b)}}if(p[c.src].finished)return;if(!a[u])p[c.src].finished=true;d=b.elem||document.createElement("script");if(c.type)d.type=c.type;if(c.charset)d.charset=c.charset;t(d,b,"finished",f);if(b.elem){b.elem=null}else if(b.text){d.onload=d.onreadystatechange=null;d.text=b.text}else{d.src=c.real_src}i.insertBefore(d,i.firstChild);if(b.text){f()}}function S(c,b,d,f){var e,g,h=function(){b.ready_cb(b,function(){R(c,b,e)})},j=function(){b.finished_cb(b,d)};b.src=N(b.src,c[B]);b.real_src=b.src+(c[A]?((/\?.*$/.test(b.src)?"&_":"?_")+~~(Math.random()*1E9)+"="):"");if(!p[b.src])p[b.src]={items:[],finished:false};g=p[b.src].items;if(c[u]||g.length==0){e=g[g.length]={ready:false,finished:false,ready_listeners:[h],finished_listeners:[j]};P(c,b,e,((f)?function(){e.ready=true;for(var a=0;a<e.ready_listeners.length;a++){e.ready_listeners[a]()}e.ready_listeners=[]}:function(){I(e)}),f)}else{e=g[0];if(e.finished){j()}else{e.finished_listeners.push(j)}}}function v(){var e,g=s(l,{}),h=[],j=0,w=false,k;function T(a,c){a.ready=true;a.exec_trigger=c;x()}function U(a,c){a.ready=a.finished=true;a.exec_trigger=null;for(var b=0;b<c.scripts.length;b++){if(!c.scripts[b].finished)return}c.finished=true;x()}function x(){while(j<h.length){if(G(h[j])){try{h[j++]()}catch(err){}continue}else if(!h[j].finished){if(O(h[j]))continue;break}j++}if(j==h.length){w=false;k=false}}function V(){if(!k||!k.scripts){h.push(k={scripts:[],finished:true})}}e={script:function(){for(var f=0;f<arguments.length;f++){(function(a,c){var b;if(!H(a)){c=[a]}for(var d=0;d<c.length;d++){V();a=c[d];if(G(a))a=a();if(!a)continue;if(H(a)){b=[].slice.call(a);b.unshift(d,1);[].splice.apply(c,b);d--;continue}if(typeof a=="string")a={src:a};a=s(a,{ready:false,ready_cb:T,finished:false,finished_cb:U});k.finished=false;k.scripts.push(a);S(g,a,k,(Q&&w));w=true;if(g[z])e.wait()}})(arguments[f],arguments[f])}return e},wait:function(){if(arguments.length>0){for(var a=0;a<arguments.length;a++){h.push(arguments[a])}k=h[h.length-1]}else k=false;x();return e}};return{script:e.script,wait:e.wait,setOptions:function(a){s(a,g);return e}}}m={setGlobalDefaults:function(a){s(a,l);return m},setOptions:function(){return v().setOptions.apply(null,arguments)},script:function(){return v().script.apply(null,arguments)},wait:function(){return v().wait.apply(null,arguments)},queueScript:function(){n[n.length]={type:"script",args:[].slice.call(arguments)};return m},queueWait:function(){n[n.length]={type:"wait",args:[].slice.call(arguments)};return m},runQueue:function(){var a=m,c=n.length,b=c,d;for(;--b>=0;){d=n.shift();a=a[d.type].apply(null,d.args)}return a},noConflict:function(){o.$LAB=K;return m},sandbox:function(){return J()}};return m}o.$LAB=J();(function(a,c,b){if(document.readyState==null&&document[a]){document.readyState="loading";document[a](c,b=function(){document.removeEventListener(c,b,false);document.readyState="complete"},false)}})("addEventListener","DOMContentLoaded")})(this);
var FreemixEmbed = {};

FreemixEmbed.postExhibitLoad = null;
FreemixEmbed.scripts = [
{% block scripts %}
    "http://api.simile.zepheira.com/exhibit/2.2.0/exhibit-api.js?autoCreate=false",
    "http://extensions.simile.zepheira.com/map/map-extension.js?service=openlayers",
    "http://api.simile.zepheira.com/exhibit/2.2.0/extensions/chart/scripts/scatter-plot-view.js",
    "http://api.simile.zepheira.com/exhibit/2.2.0/extensions/time/time-extension.js",
    "http://www.google.com/jsapi",
    "http://extensions.simile.zepheira.com/piechart/piechart-extension.js",
    "{%site_url STATIC_URL %}freemix/js/lib/jquery.js",
//    "{%site_url STATIC_URL %}freemix/js/lib/jquery.bgiframe.min.js",
    "{%site_url STATIC_URL %}freemix/js/lib/jquery.machineTag.js",
    "{%site_url STATIC_URL %}freemix/js/lib/jquery.json.js",
    "{%site_url STATIC_URL %}freemix/js/lib/jquery.highlight.js",
    "{%site_url STATIC_URL %}freemix/js/lib/lightbox.js",
    "{%site_url STATIC_URL %}freemix/js/freemix.js",
    "{%site_url STATIC_URL %}freemix/js/exhibit.js",
    "{%site_url STATIC_URL %}freemix/js/property.js",
    "{%site_url STATIC_URL %}freemix/js/identify.js",
    "{%site_url STATIC_URL %}exhibit/js/widget.js",
    "{%site_url STATIC_URL %}exhibit/js/facet.js",
    "{%site_url STATIC_URL %}exhibit/js/view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/map-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/list-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/openlayers-map-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/scatterplot-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/table-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/timeline-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/piechart-view.js",
    "{%site_url STATIC_URL %}exhibit/js/views/thumbnail-view.js",
    "{%site_url STATIC_URL %}exhibit/js/facets/search-facet.js",
    "{%site_url STATIC_URL %}exhibit/js/facets/list-facet.js",
    "{%site_url STATIC_URL %}exhibit/js/facets/slider-facet.js",
    "{%site_url STATIC_URL %}exhibit/js/facets/numeric-facet.js",

    "{%site_url STATIC_URL %}exhibit/js/facets/tagcloud-facet.js",
    "{%site_url STATIC_URL %}exhibit/js/facets/logo-facet.js",
    "{%site_url STATIC_URL %}exhibit/js/lib/creole.js",
    "{%site_url STATIC_URL %}exhibit/js/facets/text-facet.js",
    "{%site_url STATIC_URL %}exhibit/js/display.js"
{% endblock %}
];

FreemixEmbed.bootstrap = function(next) {
    $LAB.script('http://api.simile.zepheira.com/exhibit/2.2.0/exhibit-api.js?autoCreate=false&callback=FreemixEmbed.postExhibitLoad').wait();
    next();
};


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


FreemixEmbed.includeDependencies = function() {

    var styles = [
    "{% site_url STATIC_URL %}freemix/css/layout.css",
    "{% site_url STATIC_URL %}freemix/css/views.css",
    "{% site_url STATIC_URL %}exhibit/css/embed.css",
    "{% site_url STATIC_URL %}exhibit/css/canvas.css",
    "http://api.simile.zepheira.com/exhibit/2.2.0/extensions/chart/chart-extension-bundle.css"
    ];

    for (var i = 0; i < styles.length; i++) {
        FreemixEmbed.insertStyle(styles[i]);
    }

    FreemixEmbed.postExhibitLoad = function() {

        var loadString = "$LAB.setOptions({AlwaysPreserveOrder: true, UseLocalXHR: false, AllowDuplicates: false})";
        for (var i = 0; i < FreemixEmbed.scripts.length; i++) {
            if (FreemixEmbed.scripts[i].indexOf('/exhibit-api.js') != -1) {
            } else {
                loadString += ".script(\"" + FreemixEmbed.scripts[i] + "\")";
            }
        }
        eval(loadString);
    };
};

FreemixEmbed.loadFreemix = function() {
        if (typeof $ != "undefined" && typeof window.Freemix != "undefined" && typeof window.Freemix.initialize != "undefined" && typeof window.Freemix.view != "undefined" && window.Freemix.facet != "undefined" && typeof Exhibit != "undefined" && typeof Exhibit.Database != "undefined" && typeof Exhibit.OLMapView != "undefined" && typeof Exhibit.TimelineView != "undefined") {

            (function($) {

                var randTmpId = 'embed-shell-' + Math.round(Math.random()*1000);
                var title_html = "<div id='titles' class='colhead'>" +
                                "<h1 id='title' title='Title'>{{ title }}</h1>" +
                                "<h2 id='subtitle' title='Subtitle'>{{ description }}</h2>" +
                                "</div>";
                $('#{{where}}').after('<div id="' + randTmpId + '" class="freemix-themeable container_12">' +
                        '<div class="ui-widget-content ui-helper-clearfix"><div class="freemix-themeable">' +
                        '<div id="canvas">' + title_html +
                        '{{ canvas|safe }}</div></div></div></div>');

                $('#'+randTmpId).append('<div class="embed-watermark">See the <a href="{{permalink}}">original Exhibit</a>, created with and hosted by <a href="{% site_url %}">{{ SITE_NAME }}</a>.</div>');

                var begin = function(next) {
                    window.Freemix.profile = {{ metadata|safe }};
                    window.Freemix.data_profile = {{ data_profile|safe }};

                    window.Freemix.data ={
                        "items": {{data|safe}}["items"],
                        "properties": {{properties|safe}}["properties"]

                    };
                    window.Freemix.initialize(next);
                };

                var end = function() {
                    $.noConflict(true);
                };

                begin(end);
                if (typeof window.removeEventListener != "undefined") {
                    window.removeEventListener('load', FreemixEmbed.loadFreemix, false);
                } else {
                    window.detachEvent('onload', FreemixEmbed.loadFreemix);
                }
            })(Freemix.jQuery);
        } else {
            setTimeout(FreemixEmbed.loadFreemix, 100);
        }
};

FreemixEmbed.bootstrap(FreemixEmbed.includeDependencies);
if (typeof window.addEventListener != "undefined") {
    window.addEventListener('load', FreemixEmbed.loadFreemix, false);
} else {
    window.attachEvent('onload', FreemixEmbed.loadFreemix);
}

