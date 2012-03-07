
var uservoiceOptions = {
    /* required */
     key: '{{key}}'
,    host: '{{host}}'
,    forum: '{{forum}}'
,    showTab: true
    /* optional */
,    alignment: 'right'
,    background_color:'#3EA43D'
,    text_color: 'white'
,    hover_color: '#1591AD'
,    lang: 'en'
{% if token %}
,    params: {sso: "{{token}}" }
{% endif %}
};
function _loadUserVoice() {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', ("https:" == document.location.protocol ? "https://" : "http://") + "cdn.uservoice.com/javascripts/widgets/tab.js");
  document.getElementsByTagName('head')[0].appendChild(s);
}
_loadSuper = window.onload;
window.onload = (typeof window.onload != 'function') ? _loadUserVoice : function() { _loadSuper(); _loadUserVoice(); };