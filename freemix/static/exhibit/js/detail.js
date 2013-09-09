/*global jQuery */
(function($) {
    
    function setupEditDetails() {
	$('#edit_exhibit_form_template').load($("#detail_edit_button").attr("rel"));
    }


    function setupEmbed() {
        if ($("#embed").length) {
            $('#embed-info-close').click(function() {
                $('#embed-info').slideUp();
            });
            $('.exhibit_embed').click(function(e) {
                e.preventDefault();
                $('#embed-info').slideDown();
                $('#embedding-code').get(0).focus();
                $('#embedding-code').highlight();
                return false;
            });
        }
    }

    function setup() {
        setupEditDetails();
        setupEmbed();
    }

    $(document).ready(setup);
})(jQuery);
