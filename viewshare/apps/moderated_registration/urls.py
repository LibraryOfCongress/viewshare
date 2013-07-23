"""
URL patterns for user registration, admin authorization, and activation
"""
from django.conf.urls.defaults import patterns, url

from .views import ModeratedActivationView, ModeratedRegistrationView


urlpatterns = patterns('',
    url(r'^activate/complete/$',
        'viewshare.apps.moderated_registration.views.activation_complete',
       name='registration_activation_complete'),
    # Activation keys get matched by \w+ instead of the more specific
    # [a-fA-F0-9]{40} because a bad activation key should still get to the
    # view;
    # that way it can return a sensible "invalid key" message instead of a
    # confusing 404.
    url(r'^activate/(?P<activation_key>\w+)/$',
        ModeratedActivationView.as_view(),
        name='registration_activate'),
    url(r'^register/$',
        ModeratedRegistrationView.as_view(),
        name='registration_register'),

    url(r'^register/complete/$',
        'viewshare.apps.moderated_registration.views.registration_complete',
        name='registration_complete'),

    url(r'^register/closed/$',
        'viewshare.apps.moderated_registration.views.registration_closed',
       name='registration_disallowed'),
    )
