/**
 * Make a DOM element highlighted and immediately available for copy.
 * Don't try to use it with more than one element, please.
 */
(function($){
    $.fn.highlight = function() {
        if ($.browser.msie) {
            var range = document.body.createTextRange();
            range.moveToElementText(this.get(0));
            range.select();
        } else {
            var range = document.createRange();
            range.selectNode(this.get(0));
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        return this;
    };
})(jQuery);
