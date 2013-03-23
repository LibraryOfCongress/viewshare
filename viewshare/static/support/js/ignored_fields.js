(function($) {

    function getFormUrl() {
        return $("link[rel='support/ignored_fields']").attr("href");
    }


    function resetForm() {
        var dialog = $("div#support");
        var form = $("form", dialog);
        form.uniform();

        form.attr("action", getFormUrl());

        var contact_visibility = function() {
            if ($("#id_contact_type").val() == "email") {
                $("#div_id_contact_phone").hide();
                $("#div_id_contact_email").show().effect("highlight");
            } else if ($("#id_contact_type").val() == "phone") {
                $("#div_id_contact_email").hide();
                $("#div_id_contact_phone").show().effect("highlight");
            }
        };

        $("#id_contact_type").change(function() {
            contact_visibility();
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
                           $("#support").show();
                           dialog.find(".messages").remove().end().prepend(this);
                       });

                   }
        });
        contact_visibility();
        return form;
    }

    function setup() {
        $("#contents").bind("post_setup_identifier.dataset", function(event, data) {

            if (data.diagnostics) {
                var values = [];
                $.each(data.diagnostics, function() {
                    if (this.unknown_top_level_elements) {
                        for (var inx = 0 ; inx < this.unknown_top_level_elements.length ; inx++) {
                            if (values.indexOf(this.unknown_top_level_elements[inx]) < 0) {
                                values.push(this.unknown_top_level_elements[inx]);
                            }
                        }
                    }
                });
                if (values.length > 0) {
                    $("#load-info-unknown-elements").data("values", values);
                    $("#load-info-unknown-elements").show();
                } else {
                    $("#load-info-unknown-elements").hide();
                }

            }
        });

        var root = $("div#support");
        $("#load-info-unknown-elements a.support-link").click(function(e) {

            e.preventDefault();
            root.empty().load(getFormUrl() + " #issue_create_content", function() {
                var form = resetForm();
                var data = $("#load-info-unknown-elements").data("values");
                var values = "";
                $.each(data, function() {
                    values += form.find("#id_elements").val();
                    values += this + "\n";

                });
                form.find("#id_elements").val(values);
                root.data("from", "#identify #editor");
                $("#identify #editor, #subnav").hide();
                root.show();

            });

        });

    }

    $(document).ready(setup);

})(jQuery);

