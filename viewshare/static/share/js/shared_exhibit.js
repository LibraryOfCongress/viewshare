(function($, Freemix) {

    $(document).ready(function() {
        $(".shared-key-url").live("click", function() {
            $(this).select();
        });
        Freemix.initialize();
    });

 })(window.Freemix.jQuery, window.Freemix);