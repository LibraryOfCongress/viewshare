/*global jQuery */
(function($) {

    function setupShareDetails() {
	$('#share_exhibit_form_template').load($("#exhibit-share-button").attr("rel"));
    }

    function setupForm(dialog) {
        var form = dialog.find("form");  

        form.ajaxForm({
            "target": dialog,
            "success": function() {
                if (dialog.has("form").length > 0) {
                    setupForm(dialog);
                }
                return false;

            }
        });
    }

    function setupSaveButton() {

        $("#exhibit-share-form").on("show", function() {
                var url = $("a#exhibit-share-button").attr("rel");
                $('#share_exhibit_form_template').load(url, function (responseText, textStatus, XMLHttpRequest) {
			setupForm($('#share_exhibit_form_template'));
			$(".shared-key-form-cancel").click(function() { $('#share_exhibit_form_template').modal("hide"); });
		    });
                return true;
            });

        $("#exhibit-share-form").on("hide", function() {
                var redirect = $("a#exhibit-share-button").attr("rev");

		/* test if shared key is generated */
		
		if ((redirect) && ($(".shared_key_url").length > 0)) {
		    window.location.href = redirect;
		}

		return true;
	    });
    }

    $(".shared-key-url").live("click", function() {
        $(this).select();
    });

    $(document).ready(setupSaveButton);

})(jQuery);