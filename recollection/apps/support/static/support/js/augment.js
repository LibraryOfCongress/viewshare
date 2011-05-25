(function($, Freemix) {

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

        var browser_visibility = function() {
            if ($("#id_browser").val() == "other") {
                $("#div_id_browser_text").show().effect("highlight");
            } else {
                $("#div_id_browser_text").hide();
                $("#id_browser_text").val("");
            }
        };

        $("#id_contact_type").change(function() {
            contact_visibility();
        });

        $("#id_browser").change(function() {
            browser_visibility();
        });

        form.ajaxForm({
            success: function(responseText, statusText, xhr, $form) {
                         dialog.empty().append($(responseText).find("#issue_create_content"));
                         resetForm();
                         $("#support-spinner").hide();
                         $("#support").show();

                     },
            beforeSubmit: function() {
                              $("#support").hide();
                              $("#support-spinner").show();
                          },
            error: function() {
                         var error = $("<div>").load("/support/issue/create_error", function() {
                             $(".messages>li.error", $(this)).addClass("ui-corner-all").addClass("ui-state-error");
                             $(".messages>li", $(this)).prepend("<a href='#' class='ui-icon ui-icon-closethick close-message'>&#160;</a> ");
                             $("#support-spinner").hide();
                             $("#support").show();
                             dialog.find(".messages").remove().end().prepend(this);
                         });

                     }
        });
        contact_visibility();
        browser_visibility();
        return form;
    }

    function setup() {
        var root = $("div#support");
        $("a#augment-support-link").click(function(e) {
            e.preventDefault();
            root.empty().load("/support/issue/augmentation/ #issue_create_content", function() {
                var form = resetForm();

                var p = $("#augment-failure-picker").data("property");
                $("#id_field_name", form).val(p.name());
                $("#id_profile_json", form).val($.toJSON($.extend({},  $.exhibit.exportDatabase($.exhibit.database), {"data_profile": Freemix.profile})));
                root.data("from", "#augment-failure-picker");
                $("#augment-failure-picker, #identify #editor, #subnav").hide();
                root.show();

            });

        });
    }

    $(document).ready(setup);
})(jQuery, jQuery.freemix);
