from django.conf.urls.defaults import *
from viewshare.apps.account.forms import *

urlpatterns = patterns('',
    url(r'^email/$', 'viewshare.apps.account.views.email', name="acct_email"),
    url(r'^login/$', 'viewshare.apps.account.views.login', name="acct_login"),
    url(r'^password_change/$', 'viewshare.apps.account.views.password_change', name="acct_passwd"),
    url(r'^password_set/$', 'viewshare.apps.account.views.password_set', name="acct_passwd_set"),

    url(r'^password_reset/$', 'viewshare.apps.account.views.password_reset', name="acct_passwd_reset"),
    url(r'^timezone/$', 'viewshare.apps.account.views.timezone_change', name="acct_timezone_change"),

    url(r'^language/$', 'viewshare.apps.account.views.language_change', name="acct_language_change"),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {"template_name": "account/logout.html"}, name="acct_logout"),
    
    url(r'^confirm_email/(\w+)/$', 'emailconfirmation.views.confirm_email', name="acct_confirm_email"),

    # Setting the permanent password after getting a key by email
    url(r'^password_reset_key/(\w+)/$', 'viewshare.apps.account.views.password_reset_from_key', name="acct_passwd_reset_key"),

)
