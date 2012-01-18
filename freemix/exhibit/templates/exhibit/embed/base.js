{% load freemix_helpers %}

// Embed material follows LABjs definition, for loading scripts in a
// certain order

/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v1.2.0 (c) Kyle Simpson
    MIT License
*/
(function(p){var q="string",w="head",L="body",M="script",u="readyState",j="preloaddone",x="loadtrigger",N="srcuri",E="preload",Z="complete",y="done",z="which",O="preserve",F="onreadystatechange",ba="onload",P="hasOwnProperty",bb="script/cache",Q="[object ",bw=Q+"Function]",bx=Q+"Array]",e=null,h=true,i=false,k=p.document,bc=p.location,bd=p.ActiveXObject,A=p.setTimeout,be=p.clearTimeout,R=function(a){return k.getElementsByTagName(a)},S=Object.prototype.toString,G=function(){},r={},T={},bf=/^[^?#]*\//.exec(bc.href)[0],bg=/^\w+\:\/\/\/?[^\/]+/.exec(bf)[0],by=R(M),bh=p.opera&&S.call(p.opera)==Q+"Opera]",bi=("MozAppearance"in k.documentElement.style),bj=(k.createElement(M).async===true),v={cache:!(bi||bh),order:bi||bh||bj,xhr:h,dupe:h,base:"",which:w};v[O]=i;v[E]=h;r[w]=k.head||R(w);r[L]=R(L);function B(a){return S.call(a)===bw}function U(a,b){var c=/^\w+\:\/\//,d;if(typeof a!=q)a="";if(typeof b!=q)b="";d=((/^\/\//.test(a))?bc.protocol:"")+a;d=(c.test(d)?"":b)+d;return((c.test(d)?"":(d.charAt(0)==="/"?bg:bf))+d)}function bz(a){return(U(a).indexOf(bg)===0)}function bA(a){var b,c=-1;while(b=by[++c]){if(typeof b.src==q&&a===U(b.src)&&b.type!==bb)return h}return i}function H(t,l){t=!(!t);if(l==e)l=v;var bk=i,C=t&&l[E],bl=C&&l.cache,I=C&&l.order,bm=C&&l.xhr,bB=l[O],bC=l.which,bD=l.base,bn=G,J=i,D,s=h,m={},K=[],V=e;C=bl||bm||I;function bo(a,b){if((a[u]&&a[u]!==Z&&a[u]!=="loaded")||b[y]){return i}a[ba]=a[F]=e;return h}function W(a,b,c){c=!(!c);if(!c&&!(bo(a,b)))return;b[y]=h;for(var d in m){if(m[P](d)&&!(m[d][y]))return}bk=h;bn()}function bp(a){if(B(a[x])){a[x]();a[x]=e}}function bE(a,b){if(!bo(a,b))return;b[j]=h;A(function(){r[b[z]].removeChild(a);bp(b)},0)}function bF(a,b){if(a[u]===4){a[F]=G;b[j]=h;A(function(){bp(b)},0)}}function X(b,c,d,g,f,n){var o=b[z];A(function(){if("item"in r[o]){if(!r[o][0]){A(arguments.callee,25);return}r[o]=r[o][0]}var a=k.createElement(M);if(typeof d==q)a.type=d;if(typeof g==q)a.charset=g;if(B(f)){a[ba]=a[F]=function(){f(a,b)};a.src=c;if(bj){a.async=i}}r[o].insertBefore(a,(o===w?r[o].firstChild:e));if(typeof n==q){a.text=n;W(a,b,h)}},0)}function bq(a,b,c,d){T[a[N]]=h;X(a,b,c,d,W)}function br(a,b,c,d){var g=arguments;if(s&&a[j]==e){a[j]=i;X(a,b,bb,d,bE)}else if(!s&&a[j]!=e&&!a[j]){a[x]=function(){br.apply(e,g)}}else if(!s){bq.apply(e,g)}}function bs(a,b,c,d){var g=arguments,f;if(s&&a[j]==e){a[j]=i;f=a.xhr=(bd?new bd("Microsoft.XMLHTTP"):new p.XMLHttpRequest());f[F]=function(){bF(f,a)};f.open("GET",b);f.send("")}else if(!s&&a[j]!=e&&!a[j]){a[x]=function(){bs.apply(e,g)}}else if(!s){T[a[N]]=h;X(a,b,c,d,e,a.xhr.responseText);a.xhr=e}}function bt(a){if(typeof a=="undefined"||!a)return;if(a.allowDup==e)a.allowDup=l.dupe;var b=a.src,c=a.type,d=a.charset,g=a.allowDup,f=U(b,bD),n,o=bz(f);if(typeof d!=q)d=e;g=!(!g);if(!g&&((T[f]!=e)||(s&&m[f])||bA(f))){if(m[f]!=e&&m[f][j]&&!m[f][y]&&o){W(e,m[f],h)}return}if(m[f]==e)m[f]={};n=m[f];if(n[z]==e)n[z]=bC;n[y]=i;n[N]=f;J=h;if(!I&&bm&&o)bs(n,f,c,d);else if(!I&&bl)br(n,f,c,d);else bq(n,f,c,d)}function Y(a){if(t&&!I)K.push(a);if(!t||C)a()}function bu(a){var b=[],c;for(c=-1;++c<a.length;){if(S.call(a[c])===bx)b=b.concat(bu(a[c]));else b[b.length]=a[c]}return b}D={script:function(){be(V);var a=bu(arguments),b=D,c;if(bB){for(c=-1;++c<a.length;){if(B(a[c]))a[c]=a[c]();if(c===0){Y(function(){bt((typeof a[0]==q)?{src:a[0]}:a[0])})}else b=b.script(a[c]);b=b.wait()}}else{for(c=-1;++c<a.length;){if(B(a[c]))a[c]=a[c]()}Y(function(){for(c=-1;++c<a.length;){bt((typeof a[c]==q)?{src:a[c]}:a[c])}})}V=A(function(){s=i},5);return b},wait:function(a){be(V);s=i;if(!B(a))a=G;var b=H(t||J,l),c=b.trigger,d=function(){try{a()}catch(err){}c()};delete b.trigger;var g=function(){if(J&&!bk)bn=d;else d()};if(t&&!J)K.push(g);else Y(g);return b}};if(t){D.trigger=function(){var a,b=-1;while(a=K[++b])a();K=[]}}else D.trigger=G;return D}function bv(a){var b,c={},d={"UseCachePreload":"cache","UseLocalXHR":"xhr","UsePreloading":E,"AlwaysPreserveOrder":O,"AllowDuplicates":"dupe"},g={"AppendTo":z,"BasePath":"base"};for(b in d)g[b]=d[b];c.order=!(!v.order);for(b in g){if(g[P](b)&&v[g[b]]!=e)c[g[b]]=(a[b]!=e)?a[b]:v[g[b]]}for(b in d){if(d[P](b))c[d[b]]=!(!c[d[b]])}if(!c[E])c.cache=c.order=c.xhr=i;c.which=(c.which===w||c.which===L)?c.which:w;return c}p.$LAB={setGlobalDefaults:function(a){v=bv(a)},setOptions:function(a){return H(i,bv(a))},script:function(){return H().script.apply(e,arguments)},wait:function(){return H().wait.apply(e,arguments)}};(function(a,b,c){if(k[u]==e&&k[a]){k[u]="loading";k[a](b,c=function(){k.removeEventListener(b,c,i);k[u]=Z},i)}})("addEventListener","DOMContentLoaded")})(window);

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

FreemixEmbed.insertScript = function(src) {
    return;
    FreemixEmbed.insert(
        'script',
        'application/javascript',
        { 'src': src }
    );
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
                    window.Freemix.data = {{ data|safe }};
                    window.Freemix.data_profile = {{ data_profile|safe }};
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


