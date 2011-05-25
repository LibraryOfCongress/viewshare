// By default, any browser that doesn't match stated compatible
// browsers will be considered incompatible.

var Compatible = {};

Compatible.checkBrowser = function() {
    var compatible = false;
    if ($.browser.mozilla) {
	if (parseFloat($.browser.version) >= 1.8) {
	    compatible = true;
	}
    } else if ($.browser.msie) {
	if (parseInt($.browser.version) >= 7) {
	    compatible = true;
	}
    } else if ($.browser.safari) {
	if (parseInt($.browser.version) >= 300) {
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
