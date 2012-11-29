from django.conf.urls import url, patterns


urlpatterns = patterns('',
    url(r'^options.js$',
        'viewshare.apps.uservoice.views.uservoice_options',
        name='uservoice_options'),

    url(r'^login/$',
        'viewshare.apps.uservoice.views.login',
        name="uservoice_acct_login"),

)
