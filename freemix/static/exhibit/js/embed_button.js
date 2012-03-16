(function($, Freemix) {
    // this could also be templated instead
    Freemix.generateEmbedCode = function() {
        var uri = document.location.href;
        if (uri.substring(uri.length-1) != "/") {
            uri += "/";
        }
        var embedURI = uri + "embed.js";
        var embedCode = '&lt;script id="freemix-embed" src="' + embedURI +'" type="text/javascript"&gt;&lt;/script&gt;\n';
        return embedCode;
    };

    Freemix.embedWidget = function(el) {
        var jEl = $('#' + el);
        $('#embedding-code').html(Freemix.generateEmbedCode());
        $('#embed-info-close').click(function() {
            $('#embed-info').hide();
            $('#embed-activate').show();
        });
        $('#embed-activate').click(function() {
            $(this).hide();
            $('#embed-info').show();
            $('#embedding-code').get(0).focus();
            $('#embedding-code').highlight();
        });
    };
})(window.Freemix.jQuery, window.Freemix);
