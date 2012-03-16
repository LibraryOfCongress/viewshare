/*global jQuery */
(function($) {

    var dialog;

    function setupForm(dialog) {
            $(".exhibit-edit-form-cancel", dialog).click(function() {
                dialog.dialog("close");
                return false;
            });

            $("form", dialog).ajaxForm({
                "success": function(response, status, xhr, form) {
                    var html = $(response);
                    if (html.has("form").length > 0) {
                        dialog.html(html);
                        setupForm(dialog);
                    } else {
                        $("#exhibit_metadata").html(html);
                        dialog.dialog("close");
                        dialog.empty();
                    }

                }
            });
    }

    function loadEditor(evt) {

        var url = $(this).attr("href");
        dialog.dialog("open");
        dialog.load(url, function(response, status, xhr) {
            setupForm(dialog)
        });
        return false;

    }

    function setupEditDetails() {
        dialog = $('<div style="display:hidden"></div>').appendTo('body');

        dialog.dialog({
            width: 400,
	    position: "center",
	    height: "auto",
            modal: true,
            draggable: false,
            resizable: false,
            autoOpen: false,
            title: "Edit Data View Details"
        });

        $("#detail_edit_button").live("click", loadEditor);
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
