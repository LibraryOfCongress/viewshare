(function($) {
    function setup() {
        var root = $("div#support");
        $("div#support .cancel-button").on('click', function() {
            root.hide();
            $(root.data("from") + ", #subnav").fadeIn();
        });

        $("div#support .ticket-created").on('click', function() {
            root.hide();
            $(root.data("from") + ", #subnav").fadeIn();
        });

    }

    $(document).ready(setup);
})(jQuery);

