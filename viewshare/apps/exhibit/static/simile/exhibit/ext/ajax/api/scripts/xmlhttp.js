/**
 * @fileOverview XmlHttp utility functions
 * @name SimileAjax.XmlHttp
 */

define(["./debug", "./platform"], function(Debug, Platform) {
var XmlHttp = new Object();

/**
 *  Callback for XMLHttp onRequestStateChange.
 */
XmlHttp._onReadyStateChange = function(xmlhttp, fError, fDone) {
    switch (xmlhttp.readyState) {
    // 1: Request not yet made
    // 2: Contact established with server but nothing downloaded yet
    // 3: Called multiple while downloading in progress
    
    // Download complete
    case 4:
        try {
            if (xmlhttp.status == 0     // file:// urls, works on Firefox
             || xmlhttp.status == 200   // http:// urls
            ) {
                if (fDone) {
                    fDone(xmlhttp);
                }
            } else {
                if (fError) {
                    fError(
                        xmlhttp.statusText,
                        xmlhttp.status,
                        xmlhttp
                    );
                }
            }
        } catch (e) {
            Debug.exception("XmlHttp: Error handling onReadyStateChange", e);
        }
        break;
    }
};

/**
 *  Creates an XMLHttpRequest object. On the first run, this
 *  function creates a platform-specific function for
 *  instantiating an XMLHttpRequest object and then replaces
 *  itself with that function.
 */
XmlHttp._createRequest = function() {
    if (Platform.browser.isIE) {
        var programIDs = [
        "Msxml2.XMLHTTP",
        "Microsoft.XMLHTTP",
        "Msxml2.XMLHTTP.4.0"
        ];
        for (var i = 0; i < programIDs.length; i++) {
            try {
                var programID = programIDs[i];
                var f = function() {
                    return new ActiveXObject(programID);
                };
                var o = f();
                
                // We are replacing the _createXmlHttpRequest
                // function with this inner function as we've
                // found out that it works. This is so that we
                // don't have to do all the testing over again
                // on subsequent calls.
                XmlHttp._createRequest = f;
                
                return o;
            } catch (e) {
                // silent
            }
        }
        // fall through to try new XMLHttpRequest();
    }

    try {
        var f = function() {
            return new XMLHttpRequest();
        };
        var o = f();
        
        // We are replacing the _createXmlHttpRequest
        // function with this inner function as we've
        // found out that it works. This is so that we
        // don't have to do all the testing over again
        // on subsequent calls.
        XmlHttp._createRequest = f;
        
        return o;
    } catch (e) {
        throw new Error("Failed to create an XMLHttpRequest object");
    }
};

/**
 * Performs an asynchronous HTTP GET.
 *  
 * @param {Function} fError a function of the form 
     function(statusText, statusCode, xmlhttp)
 * @param {Function} fDone a function of the form function(xmlhttp)
 */
XmlHttp.get = function(url, fError, fDone) {
    var xmlhttp = XmlHttp._createRequest();
    
    xmlhttp.open("GET", url, true);
    xmlhttp.onreadystatechange = function() {
        XmlHttp._onReadyStateChange(xmlhttp, fError, fDone);
    };
    xmlhttp.send(null);
};

/**
 * Performs an asynchronous HTTP POST.
 *  
 * @param {Function} fError a function of the form 
     function(statusText, statusCode, xmlhttp)
 * @param {Function} fDone a function of the form function(xmlhttp)
 */
XmlHttp.post = function(url, body, fError, fDone) {
    var xmlhttp = XmlHttp._createRequest();
    
    xmlhttp.open("POST", url, true);
    xmlhttp.onreadystatechange = function() {
        XmlHttp._onReadyStateChange(xmlhttp, fError, fDone);
    };
    xmlhttp.send(body);
};

XmlHttp._forceXML = function(xmlhttp) {
    try {
        xmlhttp.overrideMimeType("text/xml");
    } catch (e) {
        xmlhttp.setrequestheader("Content-Type", "text/xml");
    }
};

    return XmlHttp;
});
