$(document).ready(function(){
    $('.ui-state-default').live('mouseover',function(){
        $(this).addClass('ui-state-hover');
    });
    $('.ui-state-default').live('mouseout',function(){
        $(this).removeClass('ui-state-hover');
    });

    $(".messages>li.info").addClass("ui-corner-all").addClass("ui-state-highlight");
    $(".messages>li.error").addClass("ui-corner-all").addClass("ui-state-error");
    $(".messages>li").prepend("<a href='#' class='ui-icon ui-icon-closethick close-message'>&#160;</a> ")
    // clear warning messages
    $('a.close-message').live('click',function(e) {
        var messages = $(this).closest(".messages");
//        if (messages.find("li:visible").length == 1) {
//            messages.slideUp();
//        } else {
//            $(this).parent().slideUp();
//        }
        $(this).parent().slideUp();
        e.preventDefault();
    });

    // auto select version on click
    $('#versions').bind('click', function() {
        $(this).highlight();
        return false;
    });
});
