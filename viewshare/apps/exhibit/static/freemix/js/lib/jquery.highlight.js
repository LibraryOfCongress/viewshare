/**
 * Make a DOM element highlighted and immediately available for copy.
 * Don't try to use it with more than one element, please.
 */
(function($){
    $.fn.highlight = function() {
        var doc = document,
            element = this[0],
            range,
            selection;
        if (doc.body.createTextRange) {
            range = doc.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        return this;
    };
})(jQuery);
