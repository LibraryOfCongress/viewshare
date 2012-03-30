from django.conf.urls.defaults import url, patterns


urlpatterns = patterns('',
    url(r'^options.js$',
        'viewshare.uservoice.views.uservoice_options',
        name='uservoice_options'),

    url(r'^login/$',
        'viewshare.uservoice.views.login',
        name="uservoice_acct_login"),

)
