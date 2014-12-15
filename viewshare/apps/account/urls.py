from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from viewshare.apps.account import views

urlpatterns = patterns('',
    url(r'^login/$',
        'viewshare.apps.account.views.login',
        name="acct_login"),

    url(r'^logout/$',
        'django.contrib.auth.views.logout',
        {"template_name": "account/logout.html"},
        name="acct_logout"),

    url(r'^email/$',
        login_required(views.SetEmailView.as_view()),
        name="acct_email"),

    url(r'^confirm_email/(\w+)/$',
        views.EmailConfirmationView.as_view(),
        name="acct_confirm_email"),

    url(r'^password_change/$',
        'viewshare.apps.account.views.password_change',
        name="acct_passwd"),

    url(r'^password_set/$',
        'viewshare.apps.account.views.password_set',
        name="acct_passwd_set"),

    url(r'^password_reset/$',
        'viewshare.apps.account.views.password_reset',
        name="acct_passwd_reset"),

    # Setting the permanent password after getting a key by email
    url(r'^password_reset_key/(\w+)/$',
        'viewshare.apps.account.views.password_reset_from_key',
        name="acct_passwd_reset_key"),

)
