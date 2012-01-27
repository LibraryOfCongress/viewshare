(function($) {


    function setup() {
        var form = $("form");

        var input = $("#id_org_type");
        input.autocomplete({
            source: org_types,
            minLength: 0
        });


        var button = $( "<button type='button'>&nbsp;</button>" )
            .attr( "tabIndex", -1 )
            .attr( "title", "Show All Items" )
            .insertAfter( input )
            .button({
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            })
            .removeClass( "ui-corner-all" )
            .addClass( "ui-corner-right ui-button-icon" )
            .click(function() {
                // close if already visible
                if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                    input.autocomplete( "close" );
                    return;
                }

                // work around a bug (likely same cause as #5265)
                $( this ).blur();

                // pass empty string as value to search for, displaying all results
                input.autocomplete( "search", "" );
                input.focus();
            });
        $("#div_id_org_type").append(button);
        $("#id_username").focus();
    }
    $(document).ready(setup);

})(jQuery);
