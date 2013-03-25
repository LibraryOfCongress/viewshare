(function($) {

    function getFormUrl() {
        return $("link[rel='freemix/support']").attr("href");
    }

    function resetForm() {
        var dialog = $("div#support");
        var form = $("form", dialog);
        form.uniform();

        var contact_visibility = function() {
            if ($("#id_contact_type").val() == "email") {
                $("#div_id_contact_phone").hide();
                $("#div_id_contact_email").show().effect("highlight");
            } else if ($("#id_contact_type").val() == "phone") {
                $("#div_id_contact_email").hide();
                $("#div_id_contact_phone").show().effect("highlight");
            }
        };

        var reason_visibility = function() {
            if ($("#id_issue_reason").val() == "other") {
                $("#div_id_issue_reason_text").show().effect("highlight");
            } else {
                $("#div_id_issue_reason_text").hide();
                $("#id_issue_reason_text").val("");
            }
        };

        var format_visibility = function() {
            if ($("#id_file_format").val() == "other") {
                $("#div_id_file_format_text").show().effect("highlight");
            } else {
                $("#div_id_file_format_text").hide();
                $("#id_file_format_text").val("");
            }

        };

        $("#id_contact_type").change(function() {
            contact_visibility();
        });

        $("#id_issue_reason").change(function() {
            reason_visibility();
        });

        $("#id_file_format").change(function() {
            format_visibility();
        });

        form.ajaxForm({
            success: function(responseText, statusText, xhr, $form) {
                         dialog.empty().append($(responseText).find("#issue_create_content"));
                         resetForm();
                         $("#support-spinner").hide();
                         $("#support").show();
                     },
            beforeSubmit: function(formData, jqForm, options) {
                              $("#support").hide();
                              $("#support-spinner").show();
                          },
            error: function() {
                       var error = $("<div>").load("/support/issue/create_error", function() {
                           $(".messages>li.error", $(this)).addClass("ui-corner-all").addClass("ui-state-error");
                           $(".messages>li", $(this)).prepend("<a href='#' class='ui-icon ui-icon-closethick close-message'>&#160;</a> ");
                           $("#support-spinner").hide();
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

        $("div#support .cancel-button").live('click', function() {
            root.hide();
            $("#load-error").fadeIn();
        });

        $("div#support .ticket-created").live('click', function() {
            root.hide();
            $("#load-error").fadeIn();
        });


    }

    $(document).ready(setup);

})(jQuery);
