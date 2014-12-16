/*global jQuery */
(function($) {

    function setupEditDetails() {
        $('#edit_exhibit_form_template').load($("#detail_edit_button").attr("rel"));
    }


    function setupEmbed() {

        $(".embedding-code").click(function(e) {
            "use strict";
            e.preventDefault();
            $(this).select();
            return false;
        });
    }

    function setup() {
        setupEditDetails();
        setupEmbed();
    }

    $(document).ready(setup);
})(jQuery);
