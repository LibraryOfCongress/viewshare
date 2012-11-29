(function($) {
    $("body").live('rendered.exhibit', function() {
        var extype = window.exhibit._database._types['Item'];
        extype._custom.label = "";
        extype._custom.pluralLabel = "";
        $('.exhibit-collectionSummaryWidget-count').parent().contents().filter(function(){
            return this.nodeType===3;
        }).remove();

    });
})(jQuery);
