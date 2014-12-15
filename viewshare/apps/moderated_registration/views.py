from django.views.generic.base import TemplateView
from registration import signals
from registration.backends.default.views import (
        ActivationView, RegistrationView)

from .forms import ViewShareRegistrationForm
from .models import ViewShareRegistrationProfile


class ModeratedRegistrationView(RegistrationView):
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
    model = ViewShareRegistrationProfile
    form_class = ViewShareRegistrationForm

    def register(self, request, **kwargs):
        new_user = self.model.objects.create_moderated_user(**kwargs)
        signals.user_registered.send(sender=self.__class__,
                                     user=new_user,
                                     request=request)


class ModeratedActivationView(ActivationView):
    model = ViewShareRegistrationProfile

    def activate(self, request, activation_key):
        """
        Given an an activation key, look up and activate the user
        account corresponding to that key (if possible).

        After successful activation, the signal
        ``registration.signals.user_activated`` will be sent, with the
        newly activated ``User`` as the keyword argument ``user`` and
        the class of this backend as the sender.
        """
        activated_user = self.model.objects.activate_user(activation_key)
        if activated_user:
            signals.user_activated.send(sender=self.__class__,
                                        user=activated_user,
                                        request=request)
        return activated_user


def registration_view(template):
    """Helper function to return TemplateViews."""
    return TemplateView.as_view(template_name='registration/%s' % template)


activation_complete = registration_view('activation_complete.html')


registration_complete = registration_view('registration_complete.html')


registration_closed = registration_view('registration_closed.html')
