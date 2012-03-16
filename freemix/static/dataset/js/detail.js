/*global jQuery */
(function($) {

    var dialog;

    function setupForm(dialog) {
            $(".dataset-edit-form-cancel", dialog).click(function() {
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
                        $("#dataset_metadata").html(html);
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
            title: "Edit Dataset Details"
        });

        $("#detail_edit_button").live("click", loadEditor);
    }

    function setupCreateExhibitButton() {
        var url = $("#create_exhibit_button").attr("href");
        $("#create_exhibit_button").newExhibitDialog(url);
    }

    function setup() {
        setupEditDetails();
        setupCreateExhibitButton();
    }

    $(document).ready(setup);
})(jQuery);
