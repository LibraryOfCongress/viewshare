(function($){
$(document).ajaxSend(function(event, xhr, settings) {
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && !settings.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
    }
});

})(jQuery);
