$(document).ready(function(){

    $(".messages>li.info").addClass("ui-corner-all").addClass("ui-state-highlight");
    $(".messages>li.error").addClass("ui-corner-all").addClass("ui-state-error");
    $(".messages>li").prepend("<a href='#' class='ui-icon ui-icon-closethick close-message'>&#160;</a> ")
    // clear warning messages
    $('a.close-message').live('click',function(e) {
        var messages = $(this).closest(".messages");
        $(this).parent().slideUp();
        e.preventDefault();
    });

});
