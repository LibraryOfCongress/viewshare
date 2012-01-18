/* jQuery plugin themeswitcher -- Customized from code at http://jqueryui.com/themeroller/themeswitchertool/
 * The target div should be pre-populated with the available themes via the
 * theme_list template tag
---------------------------------------------------------------------*/
$.fn.themeswitcher = function(settings){
    var options = jQuery.extend({
        loadTheme: null,
        initialText: 'Switch Theme',
        width: 150,
        height: 200,
        buttonPreText: 'Theme: ',
        closeOnSelect: true,
        buttonHeight: 14,
        cookieName: 'jquery-ui-theme',
        themes: {},
        onOpen: function(){},
        onClose: function(){},
        onSelect: function(){}
    }, settings);
    var root = $(this);
    //markup 
    var button = $('<a href="#" class="jquery-ui-themeswitcher-trigger"><span class="jquery-ui-themeswitcher-icon"></span><span class="jquery-ui-themeswitcher-title">'+ options.initialText +'</span></a>');
    var switcherpane = $('<div class="jquery-ui-themeswitcher"><div id="themeGallery"></div></div>');
    
    var ul = $(this).find("ul");
    switcherpane.find("#themeGallery").append(ul);
    ul.find("a").click(function() {
        updateCSS( $(this).attr('href') );
        button.find('.jquery-ui-themeswitcher-title').text( options.buttonPreText + $(this).find("img").attr("title") );
        options.onSelect($(this).parent("li").attr("id"));
        if(options.closeOnSelect && switcherpane.is(':visible')){ switcherpane.spHide(); }
        return false;
    });
     
    //button events
    button.click(
        function(){
            if(switcherpane.is(':visible')){ switcherpane.spHide(); }
            else{ switcherpane.spShow(); }
                    return false;
        }
    );
    
    //menu events (mouseout didn't work...)
    switcherpane.hover(
        function(){},
        function(){if(switcherpane.is(':visible')){$(this).spHide();}}
    );

    //show/hide panel functions
    $.fn.spShow = function(){ $(this).css({top: button.offset().top + options.buttonHeight + 6, left: button.offset().left}).slideDown(50); button.css(button_active); options.onOpen(); };
    $.fn.spHide = function(){ $(this).slideUp(50, function(){options.onClose();}); button.css(button_default); };
    
    //function to append a new theme stylesheet with the new style changes
    function updateCSS(locStr){
        $('link.ui-theme').remove();
        var cssLink = $('<link href="'+locStr+'" type="text/css" rel="stylesheet" class="ui-theme" />');
        $('head').append(cssLink.clone());
    }   
    
    /* Inline CSS 
    ---------------------------------------------------------------------*/
    var button_default = {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '11px',
        color: '#666',
        background: '#eee url(http://jqueryui.com/themeroller/themeswitchertool/images/buttonbg.png) 50% 50% repeat-x',
        border: '1px solid #ccc',
        '-moz-border-radius': '6px',
        '-webkit-border-radius': '6px',
        textDecoration: 'none',
        padding: '3px 3px 3px 8px',
        width: options.width - 11,//minus must match left and right padding 
        display: 'block',
        height: options.buttonHeight,
        outline: '0'
    };
    var button_hover = {
        'borderColor':'#bbb',
        'background': '#f0f0f0',
        cursor: 'pointer',
        color: '#444'
    };
    var button_active = {
        color: '#aaa',
        background: '#000',
        border: '1px solid #ccc',
        borderBottom: 0,
        '-moz-border-radius-bottomleft': 0,
        '-webkit-border-bottom-left-radius': 0,
        '-moz-border-radius-bottomright': 0,
        '-webkit-border-bottom-right-radius': 0,
        outline: '0'
    };
    
    
    
    //button css
    button.css(button_default)
    .hover(
        function(){ 
            $(this).css(button_hover); 
        },
        function(){ 
         if( !switcherpane.is(':animated') && switcherpane.is(':hidden') ){ $(this).css(button_default);  }
        }   
    )
    .find('.jquery-ui-themeswitcher-icon').css({
        'float': 'right',
        width: '16px',
        height: '16px',
        background: 'url(http://jqueryui.com/themeroller/themeswitchertool/images/icon_color_arrow.gif) 50% 50% no-repeat'
    }); 
    //pane css
    switcherpane.css({
        position: 'absolute',
        'float': 'left',
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '12px',
        background: '#000',
        color: '#fff',
        padding: '8px 3px 3px',
        border: '1px solid #ccc',
        '-moz-border-radius-bottomleft': '6px',
        '-webkit-border-bottom-left-radius': '6px',
        '-moz-border-radius-bottomright': '6px',
        '-webkit-border-bottom-right-radius': '6px',
        borderTop: 0,
        zIndex: 999999,
        width: options.width-6//minus must match left and right padding
    })
    .find('ul').css({
        listStyle: 'none',
        margin: '0',
        padding: '0',
        overflow: 'auto',
        height: options.height
    }).end()
    .find('li').hover(
        function(){ 
            $(this).css({
                'borderColor':'#555',
                'background': 'url(http://jqueryui.com/themeroller/themeswitchertool/images/menuhoverbg.png) 50% 50% repeat-x',
                cursor: 'pointer'
            }); 
        },
        function(){ 
            $(this).css({
                'borderColor':'#111',
                'background': '#000',
                cursor: 'auto'
            }); 
        }
    ).css({
        width: options.width-30,
        height: '',
        padding: '2px',
        margin: '1px',
        border: '1px solid #111',
        '-moz-border-radius': '4px',
        clear: 'left',
        'float': 'left'
    }).end()
    .find('a').css({
        color: '#aaa',
        textDecoration: 'none',
        'float': 'left',
        width: '100%',
        outline: '0'
    }).end()
    .find('img').css({
        'float': 'left',
        border: '1px solid #333',
        margin: '0 2px'
    }).end()
    .find('.themeName').css({
        'float': 'left',
        margin: '3px 0'
    }).end();
    


    $(this).append(button);
    $('body').append(switcherpane);
    switcherpane.hide();
    if(options.loadTheme ){
        var themeName =  options.loadTheme;
        switcherpane.find('li[id="' + themeName + '"] a').trigger('click');
    }

    return this;
};
