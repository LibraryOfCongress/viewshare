(function($) {

    function orgtype_visibility() {
        if ($("#id_org_type").val() == "other") {
            $("#div_id_org_text").show();
        } else {
            $("#div_id_org_text").hide();
            $("#id_org_text").val($("#id_org_type option:selected").text());
        }
    }

    function setup() {
        var form = $("form");
        $("#id_org_type").change(function() {
            orgtype_visibility();
        }).change();

        $("#id_username").focus();
    }
    $(document).ready(setup);

})(jQuery);
