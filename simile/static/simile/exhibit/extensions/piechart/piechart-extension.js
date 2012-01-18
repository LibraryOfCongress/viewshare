/**
 *  Simile Exhibit PieChart Extension
 */
Exhibit.PiechartExtension = {
    params: {
        bundle:     false
    } 
};

(function() {
    var javascriptFiles = [
        "piechart-view.js"
    ];
    var cssFiles = [];
        
    var url = SimileAjax.findScript(document, "/piechart-extension.js");
    if (url == null) {
        SimileAjax.Debug.exception(new Error("Failed to derive URL prefix for Simile Exhibit Map Extension code files"));
        return;
    }
    Exhibit.PiechartExtension.urlPrefix = url.substr(0, url.indexOf("piechart-extension.js"));
        
    var paramTypes = { bundle: Boolean };
    SimileAjax.parseURLParameters(url, Exhibit.PiechartExtension.params, paramTypes);
        
    var scriptURLs = [];
    var cssURLs = [];
    SimileAjax.prefixURLs(scriptURLs, Exhibit.PiechartExtension.urlPrefix + "scripts/", javascriptFiles);
    SimileAjax.prefixURLs(cssURLs, Exhibit.PiechartExtension.urlPrefix + "styles/", cssFiles);
    
     for (var i = 0; i < Exhibit.locales.length; i++) {
         scriptURLs.push(Exhibit.PiechartExtension.urlPrefix + "locales/" + Exhibit.locales[i] + "/piechart-locale.js");
     };
     
    SimileAjax.includeJavascriptFiles(document, "", scriptURLs);
    SimileAjax.includeCssFiles(document, "", cssURLs);
})();
