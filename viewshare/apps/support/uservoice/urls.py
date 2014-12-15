from django.conf.urls import url, patterns

urlpatterns = patterns('',
    url(r'^options.js$',
        'viewshare.apps.support.uservoice.views.uservoice_options',
        name='uservoice_options'),

    url(r'^login/$',
        'viewshare.apps.support.uservoice.views.login',
        name="uservoice_acct_login"),
)
