import random
import hashlib
from django.conf import settings
from django.contrib.auth.models import User

from django.contrib.sites.models import Site
from django.db import models, transaction
from django.template.loader import render_to_string
from django_extensions.db.fields import AutoSlugField
from registration.models import RegistrationProfile, RegistrationManager
from django.utils.translation import ugettext_lazy as _

if not settings.DEBUG:
    try:
        from mailer import send_mail
    except:
        from django.core.mail import send_mail
else:
    from django.core.mail import send_mail

class OrganizationType(models.Model):
    value = models.CharField(max_length=100, unique=True)
    key = AutoSlugField(populate_from="value")


class ModeratedRegistrationManager(RegistrationManager):

    def create_moderated_user(self, *args, **kwargs):
        username = kwargs["username"]
        password = kwargs["password1"]
        email = kwargs["email"]

        new_user = User.objects.create_user(username, email, password)
        new_user.is_active = False
        new_user.first_name=kwargs["first_name"]
        new_user.last_name=kwargs["last_name"]
        new_user.save()

        profile = new_user.get_profile()

        profile.name  = "%s %s"%(kwargs["first_name"], kwargs["last_name"])

        profile.location = kwargs["org_state"]
        if profile.location == "":
            profile.location = "Non-US"

        profile.organization = kwargs["organization"]
        profile.org_type = kwargs["org_type"]
        profile.about = kwargs["reason"]
        profile.save()

        registration_profile = self.create(user=new_user,
                    activation_key=ModeratedRegistrationProfile.PENDING
                    )
        registration_profile.send_approval_email(kwargs["site"])
        return new_user
    create_moderated_user = transaction.commit_on_success(create_moderated_user)

    def approve_profile(self, profile):
        profile.is_approved=True
        self.send_activation(profile)

    def reject_profile(self, profile):

        profile.user.delete()
        profile.delete()
        return False

    def send_activation(self, profile):
        """
        Generate an activation key for a profile that has been moderator approved and
        """

        if profile.is_approved and not profile.user.is_active:
            salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
            profile.activation_key = hashlib.sha1(salt+profile.user.username).hexdigest()
            profile.save()

            current_site = Site.objects.get_current()

            profile.send_activation_email(current_site)

        return False


class ModeratedRegistrationProfile(RegistrationProfile,models.Model):
    PENDING = "Pending Moderation"

    objects = ModeratedRegistrationManager()

    is_approved = models.BooleanField(_("approved"), default=False)

    class Meta:
        abstract=True


    def send_approval_email(self, site):
        ctx_dict = {
            'profile': self
        }

        subject = render_to_string('registration/approval_email_subject.txt',
                                   ctx_dict)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())

        message = render_to_string('registration/approval_email.txt',
                                   ctx_dict)
        to = getattr(settings, "USER_APPROVAL_EMAIL_LIST", [settings.CONTACT_EMAIL])
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, to)


class ViewShareRegistrationProfile(ModeratedRegistrationProfile):


    class Meta:
        abstract=False
