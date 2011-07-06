(function($) {

    function refreshSetList() {
        var url = $("#id_url").val();
        if (url) {
            clearUrlError();
            $("#div_id_set_choice").append("<span class='loading_message'>Loading...</span>");
            $.get($("link[type='recollection/oai_set_list']").attr("rel"), {endpoint: url}, function(data) {
                $("#id_set_choice").empty();
                if (data.length == 0) {
                    setUrlError("No OAI sets found for this URL");

                }
                for (var inx = 0 ; inx < data.length ; inx++) {
                    $("#id_set_choice").append("<option value='" + data[inx][0] + "'>" + data[inx][1] + "</option>");
                }
                var selected = $("#id_set").val();
                if (selected.trim()) {
                    $("#div_id_set_choice").val(selected);
                }
                $(".loading_message").remove();
            }, "json");
        } else {
            setUrlError();
        }
        return false;
    }

    function setupUrlRefreshButton() {
        var button = $("<button id='refresh_button'>Load Sets</button>").click(function(evt) {
            evt.preventDefault();
            refreshSetList();
            return false;
        });
        $("#id_url").after(button);

    }

    function setupSetChoiceSelect() {
        $("#id_set_choice").change(function() {
            var set_id=$("#id_set_choice option:selected").val();
            var title=$("#id_set_choice option:selected").text();
            $("#id_set").val(set_id);
            $("#id_title").val(title);
        });
    }

    function clearUrlError() {
        $("#div_id_url .errorField").remove();
        $("#div_id_url").removeClass("error");

    }

    function setUrlError(message) {
        message = message || "This field is required";
        clearUrlError();
        $("#div_id_url").addClass("error").prepend("<p id='error_1_id_url' class='errorField'>" + message + "</p>");
    }

    function setupForm() {
        setupUrlRefreshButton();
        setupSetChoiceSelect();
        if ($("#id_url").val()) {
            refreshSetList();
        }
    }

    $(document).ready(setupForm);
})(jQuery);
