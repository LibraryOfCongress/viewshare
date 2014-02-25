define(function() {
    var SimileAjax = {
        loaded:                 false,
        loadingScriptsCount:    0,
        error:                  null,
        params:                 { "bundle": true },
        paramTypes:             { "bundle": Boolean },
        version:                "3.0.0",
        jQuery:                 null, // use jQuery directly
        urlPrefix:              null
    };
    
    return SimileAjax;
});
