(function($) {
    function setup() {
        var root = $("div#support");
        $("div#support .cancel-button").live('click', function() {
            root.hide();
            $(root.data("from") + ", #subnav").fadeIn();
        });

        $("div#support .ticket-created").live('click', function() {
            root.hide();
            $(root.data("from") + ", #subnav").fadeIn();
        });

    }

    $(document).ready(setup);
})(jQuery);

