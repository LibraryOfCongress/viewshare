from django.contrib.sites.models import RequestSite, Site
from registration import signals
from registration.backends.default import DefaultBackend
from viewshare.moderated_registration import forms
from django.conf import settings
from viewshare.moderated_registration import models


class ModeratedRegistrationBackend(DefaultBackend):
    """
    Extends the default registration profile to incorporate an admin approval
    step in the user registration process

    A registration backend which follows a simple workflow:

    1. User signs up, inactive account is created.

    2. Email is sent to the admin for approval

    3. On approval, an activation key is generated

    4. Email is sent to user with activation link.

    5. User clicks activation link, account is now active.

    Using this backend requires that

    * ``registration`` and ``moderated_registration`` be listed in the
      ``INSTALLED_APPS`` setting
      (since this backend makes use of models defined in these
      applications).

    * The setting ``ACCOUNT_ACTIVATION_DAYS`` be supplied, specifying
      (as an integer) the number of days from registration during
      which a user may activate their account (after that period
      expires, activation will be disallowed).

    * The creation of the templates
      ``registration/activation_email_subject.txt`` and
      ``registration/activation_email.txt``, which will be used for
      the activation email. See the notes for this backends
      ``register`` method for details regarding these templates.

    Additionally, registration can be temporarily closed by adding the
    setting ``REGISTRATION_OPEN`` and setting it to
    ``False``. Omitting this setting, or setting it to ``True``, will
    be interpreted as meaning that registration is currently open and
    permitted.

    Internally, this is accomplished via storing an activation key in
    an instance of ``registration.models.RegistrationProfile``. See
    that model and its custom manager for full documentation of its
    fields and supported operations.

    """

    model = models.ViewShareRegistrationProfile
    form = forms.ViewShareRegistrationForm

    def register(self, request, **kwargs):

        if Site._meta.installed:
            site = Site.objects.get_current()
        else:
            site = RequestSite(request)
        ctx = dict(kwargs)
        ctx["site"] = site
        new_user = self.model.objects.create_moderated_user(**ctx)
        signals.user_registered.send(sender=self.__class__,
                                     user=new_user,
                                     request=request)
        return new_user

    def activate(self, request, activation_key):
        """
        Given an an activation key, look up and activate the user
        account corresponding to that key (if possible).

        After successful activation, the signal
        ``registration.signals.user_activated`` will be sent, with the
        newly activated ``User`` as the keyword argument ``user`` and
        the class of this backend as the sender.

        """
        activated = self.model.objects.activate_user(activation_key)
        if activated:
            signals.user_activated.send(sender=self.__class__,
                                        user=activated,
                                        request=request)
        return activated

    def registration_allowed(self, request):
        """
        Indicate whether account registration is currently permitted,
        based on the value of the setting ``REGISTRATION_OPEN``. This
        is determined as follows:

        * If ``REGISTRATION_OPEN`` is not specified in settings, or is
          set to ``True``, registration is permitted.

        * If ``REGISTRATION_OPEN`` is both specified and set to
          ``False``, registration is not permitted.

        """
        return getattr(settings, 'REGISTRATION_OPEN', True)

    def get_form_class(self, request):
        """
        Return the default form class used for user registration.

        """
        return self.form

    def post_registration_redirect(self, request, user):
        """
        Return the name of the URL to redirect to after successful
        user registration.

        """
        return 'registration_complete', (), {}

    def post_activation_redirect(self, request, user):
        """
        Return the name of the URL to redirect to after successful
        account activation.

        """
        return 'registration_activation_complete', (), {}
