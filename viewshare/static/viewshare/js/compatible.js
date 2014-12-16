// By default, any browser that doesn't match stated compatible
// browsers will be considered incompatible.

var Compatible = {};

Compatible.checkBrowser = function() {
    // Variables cribbed from jQuery 1.3.  Should be replaced by feature
    // detection as user agent data is unreliable.
    var userAgent = navigator.userAgent.toLowerCase();
    var browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
	safari: /webkit/.test( userAgent ),
	opera: /opera/.test( userAgent ),
	msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
	mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
    };
    
    var compatible = false;
    if (browser.mozilla) {
	if (parseFloat(browser.version) >= 1.8) {
	    compatible = true;
	}
    } else if (browser.msie) {
	if (parseInt(browser.version) >= 7) {
	    compatible = true;
	}
    } else if (browser.safari) {
	if (parseInt(browser.version) >= 300) {
	    compatible = true;
	}
    }
    return compatible;
};

Compatible.showWarning = function() {
    $('#compatibility-warning').show();
    $('#compatibility-warning a.close-message').bind('click', function() {
        $('#compatibility-warning').fadeOut();
        $.cookie('compat', '1', { expires: null, path: '/' });
    });
};

$(document).ready(function() {
    if (!Compatible.checkBrowser()) {
	var hideCompatMsg = $.cookie('compat');
	if (hideCompatMsg != null) {
            if (parseInt(hideCompatMsg) != 1) {
                Compatible.showWarning();
            }
        } else {
            Compatible.showWarning();            
        }
    }
});
