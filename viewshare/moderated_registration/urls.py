"""
URL patterns for user registration, admin authorization, and activation

"""

from django.conf.urls.defaults import patterns, url


_registration_backend_ = 'viewshare.moderated_registration.backend' \
                         '.ModeratedRegistrationBackend'

urlpatterns = patterns('',
    url(r'^activate/complete/$',
       'viewshare.moderated_registration.views.activation_complete',
       name='registration_activation_complete'),

    # Activation keys get matched by \w+ instead of the more specific
    # [a-fA-F0-9]{40} because a bad activation key should still get to the
    # view;
    # that way it can return a sensible "invalid key" message instead of a
    # confusing 404.
    url(r'^activate/(?P<activation_key>\w+)/$',
       'registration.views.activate',
       {'backend': _registration_backend_},
       name='registration_activate'),

    url(r'^register/$',
       'registration.views.register',
       {'backend': _registration_backend_},
       name='registration_register'),

    url(r'^register/complete/$',
        'viewshare.moderated_registration.views.registration_complete',
        name='registration_complete'),

    url(r'^register/closed/$',
        'viewshare.moderated_registration.views.registration_closed',
       name='registration_disallowed'),
    )
