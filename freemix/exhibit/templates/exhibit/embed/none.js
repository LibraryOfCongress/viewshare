{% load freemix_helpers %}

var FreemixMissing = {};

FreemixMissing.bootstrap = function(next) {
    var ans = document.createElement('script');
    ans.setAttribute('type', 'application/javascript');
    ans.setAttribute('src', '{% site_url STATIC_URL %}freemix/js/lib/jquery.js');
    document.getElementsByTagName('head')[0].appendChild(ans);
    setTimeout(next, 100);
};

FreemixMissing.showMessage = function() {
    if (typeof $ != 'undefined') {
        $('#{{where}}').after('<div>There is no such data in our records.  Please check your embedding URL and try again.</div>');
        $.noConflict(true);
    } else {
        setTimeout(FreemixMissing.showMessage, 100);
    }
};

FreemixMissing.bootstrap(FreemixMissing.showMessage);
