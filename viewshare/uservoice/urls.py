from django.conf.urls.defaults import *
from django.conf import settings

urlpatterns = patterns('',
    url(r'^options.js$', 'viewshare.uservoice.views.uservoice_options', name='uservoice_options'),
    url(r'^login/$', 'viewshare.uservoice.views.login', name="uservoice_acct_login"),

)
