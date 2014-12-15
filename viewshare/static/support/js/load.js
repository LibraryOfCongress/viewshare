(function($) {

    function getFormUrl() {
        return $("link[rel='freemix/support']").attr("href");
    }

    function resetForm() {
        var dialog = $("div#support");
        var form = $("form", dialog);

        var contact_visibility = function() {
            if (dialog.find("#id_contact_type").val() == "email") {
                dialog.find("#div_id_contact_phone").hide();
                dialog.find("#div_id_contact_email").show();
            } else if (dialog.find("#id_contact_type").val() == "phone") {
                dialog.find("#div_id_contact_email").hide();
                dialog.find("#div_id_contact_phone").show();
            }
        };

        var reason_visibility = function() {
            if (dialog.find("#id_issue_reason").val() == "other") {
                dialog.find("#div_id_issue_reason_text").show();
            } else {
                dialog.find("#div_id_issue_reason_text").hide();
                dialog.find("#id_issue_reason_text").val("");
            }
        };

        var format_visibility = function() {
            if (dialog.find("#id_file_format").val() == "other") {
                dialog.find("#div_id_file_format_text").show();
            } else {
                dialog.find("#div_id_file_format_text").hide();
                dialog.find("#id_file_format_text").val("");
            }

        };

        dialog.find("#id_contact_type").change(function() {
            contact_visibility();
        });

        dialog.find("#id_issue_reason").change(function() {
            reason_visibility();
        });

        dialog.find("#id_file_format").change(function() {
            format_visibility();
        });

        form.ajaxForm({
            success: function(responseText, statusText, xhr, $form) {
                         dialog.find("#issue_create_content").remove();
                         dialog.append($(responseText).find("#issue_create_content"));
                         resetForm();
                         dialog.find(".support-spinner").hide();
                         form.show();
                     },
            beforeSubmit: function(formData, jqForm, options) {
                              form.hide();
                              dialog.find(".support-spinner").show();
                          },
            error: function() {
                       var error = $("<div>").load("/support/issue/create_error", function() {
                           $(".messages>li.error", $(this)).addClass("ui-corner-all").addClass("ui-state-error");
                           $(".messages>li", $(this)).prepend("<a href='#' class='ui-icon ui-icon-closethick close-message'>&#160;</a> ");
                           dialog.find(".support-spinner").hide();
                           dialog.find(".messages").remove().end().prepend(this);

                           $("#load-error").show();
                       });

                   },
            iframe:true

        });
        contact_visibility();
        reason_visibility();
        format_visibility();
        return form;
    }

    function setup() {
        var root = $("div#support");
        $("a.support-link").click(function(e) {

            e.preventDefault();

            root.empty().load(getFormUrl() + " #issue_create_content", function() {
                var form = resetForm();
                $("#load-error").hide();

                root.show();
            });

        });

        $("div#support .ticket-created").on('click', function() {
            root.hide();
            $("#load-error").fadeIn();
        });


    }

    $(document).ready(setup);

})(jQuery);
