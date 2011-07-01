(function($, Freemix) {
    $(document).ready(function() {

        $("#supported-file-types").dialog({
            autoOpen: false,
            position: "top",
            width: 500,
            height: "auto",
            modal: true,
            draggable: false,
            resizable: false,
            title: $("#supported-file-types").attr("title")
        });
        $(".supported-file-types").live('click', function(e) {
            e.preventDefault();
            $("#supported-file-types").dialog("open");
        });
    });
})(jQuery, jQuery.freemix);
