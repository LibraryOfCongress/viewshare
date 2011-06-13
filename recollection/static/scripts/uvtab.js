var uservoiceOptions = {
    /* required */
    key: 'recollection',
    host: 'recollection.uservoice.com', 
    forum: '1',
    showTab: true,  
    /* optional */
    alignment: 'right',
    background_color:'#f00', 
    text_color: 'white',
    hover_color: '#06C',
    lang: 'en'
};

function _loadUserVoice() {
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', ("https:" == document.location.protocol ? "https://" : "http://") + "cdn.uservoice.com/javascripts/widgets/tab.js");
    document.getElementsByTagName('head')[0].appendChild(s);
}

$.get('/profiles/uservoice_token',function(token) {
    uservoiceOptions.params = { sso: token };
    _loadSuper = window.onload;
    window.onload = (typeof window.onload != 'function') ? _loadUserVoice : function() { _loadSuper(); _loadUserVoice(); };
});
