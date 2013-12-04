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

define(["jquery"], function($) {

    var Lightbox = {
        defaults: {
            width: 900,
            height: 550
        },
        adjusted: { },
        handlers: { }
    };

    function show_image(img) {
        Lightbox.handlers["embedded"](img);
    };

    var zIndex = 0;
    Lightbox.handlers.embedded = function(img) {
        if (zIndex == 0) {
            zIndex = Math.max.apply(null,$.map($('body > *'), function(e,n){
                   if($(e).css('position')=='absolute')
                        return parseInt($(e).css('z-index'))||1 ;
                   })
            ) + 1;
        }
        var imgHtml = $('<p class="embed-lightbox-image"><img src="' + img.src + '" /></p>').css('maxWidth', $(window).width() - 50).css('maxHeight', $(window).height() - 80);
        var dialogHtml = $('<div class="freemix-themeable embed-lightbox"></div>');
        var backdropHtml = $('<div class="embed-lightbox-backdrop">&#160;</div>')
            .css('opacity',0.25)
            .css('backgroundColor','#000')
            .css('zIndex',zIndex)
            .css('position', 'absolute')
            .css('left', "0")
            .css('top', "0")
            .height($(document).height())
            .width("100%");

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
        backdropHtml.appendTo('body').bind('click', close);
        dialogHtml.append(imgHtml);
        dialogHtml.prepend(closeHtml);
        dialogHtml.appendTo('body');

        dialogHtml
            .css('visibility', 'visible')
            .css('position', 'absolute')
            .css('zIndex', zIndex+1);

        var h = dialogHtml.outerHeight();
        if (h < img.height) {
            h += img.height;
        }
        dialogHtml.css('top', Math.floor($(document).scrollTop() + ($(window).height() - h) / 2));

        dialogHtml.css('left', "50%");
        var w = dialogHtml.outerWidth();
        if (w < img.width) {
            w += img.width;
        }
        dialogHtml.css('margin-left', Math.floor(w / 2 * -1));
    };

    $(document).ready(function() {
        $(document).on('click', 'a.lightbox', function(e) {
            var img = new Image();
            img.onload = function() {
                show_image(img);
            };
            img.src = this.href;
            e.preventDefault();
        });
    });
});