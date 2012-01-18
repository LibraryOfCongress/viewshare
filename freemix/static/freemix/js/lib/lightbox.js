/*
 * Bring up an image in a separate dialog window
 * You can accomplish this buy making an anchor with
 * the class of lightbox, preferably around a thumbnail
 * image.  The href of the link will be the contents of
 * the dialog.  For example:
 *
 * <a class="lightbox" href="big.jpg"><img src="small.jpg" /></a>
 *
 */
var Lightbox = {
    defaults: {
        width: 900,
        height: 550
    },
    adjusted: { }
};

Lightbox.onload = function(src, img) {
    Lightbox.adjusted.width = Lightbox.defaults.width > $(window).width()-40 ? $(window).width()-40 : Lightbox.defaults.width;
    Lightbox.adjusted.height = Lightbox.defaults.height > $(window).height()-40 ? $(window).height()-40 : Lightbox.defaults.height;
    if (typeof $.ui !== "undefined") {
        $('<p class="center"><img src="' + src + '" /></p>').dialog({
            modal: true,
            closeOnEscape: true,
            dialogClass: 'freemix-themeable',
            maxWidth: $(window).width() - 50,
            maxHeight: $(window).height() - 50,
            width: img.width + 40 > Lightbox.adjusted.width ? Lightbox.adjusted.width : img.width + 40,
            height: img.height + 65 > Lightbox.adjusted.height ? Lightbox.adjusted.height : img.height + 65,
            close: function(event, ui) {
                $(this).dialog('destroy');
                $(this).remove();
            }
        });
    } else {
        var imgHtml = $('<p class="embed-lightbox-image"><img src="' + src + '" /></p>').css('maxWidth', $(window).width() - 50).css('maxHeight', $(window).height() - 80);
        var dialogHtml = $('<div class="freemix-themeable embed-lightbox"></div>');
        var backdropHtml = $('<div>&#160;</div>').css('opacity',0.25).css('backgroundColor','#000').css('zIndex',50000).css('position', 'absolute').css('left', 0).css('top', 0).height($(document).height()).width($(document).width());
        var close = function(e) {
            if (e.which === 27 && e.type === 'keypress'
                || e.type !== 'keypress') {
                backdropHtml.remove();
                dialogHtml.remove();
                $(document).unbind('keypress', close);
                e.preventDefault();
            }
        };
        $(document).bind('keyup', close);
        var closeHtml = $('<p class="embed-lightbox-control"><a href="#">close</a></p>').bind('click', close);
        backdropHtml.appendTo('body');
        dialogHtml.append(imgHtml);
        dialogHtml.prepend(closeHtml);
        dialogHtml.appendTo('body');
        w = dialogHtml.outerWidth();
        h = dialogHtml.outerHeight();
        dialogHtml.css('left', ($(window).width() - w) / 2).css('top', $(document).scrollTop() + ($(window).height() - h) / 2).css('visibility', 'visible');
    }
}

$(document).ready(function() {
    $('a.lightbox').live('click', function(e) {
        var src = this.href;
        var img = new Image();
        img.onload = function() {
            Lightbox.onload(src, img);
        };	
        img.src = src;
        e.preventDefault();
    });
});
