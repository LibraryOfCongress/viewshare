import random
import hashlib
from django.conf import settings
from django.contrib.auth.models import User

from django.contrib.localflavor.us.models import USStateField
from django.contrib.sites.models import Site
from django.db import models, transaction
from django.template.loader import render_to_string
from django_extensions.db.fields import AutoSlugField
from registration.models import RegistrationProfile, RegistrationManager
from django.utils.translation import ugettext_lazy as _


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
        new_user.save()

        profile = self.create(user=new_user,
                    activation_key=ModeratedRegistrationProfile.PENDING,
                    organization=kwargs["organization"],
                    org_type=kwargs["org_text"],
                    org_state=kwargs["org_state"],
                    reason=kwargs["reason"]
                    )
        profile.send_approval_email(kwargs["site"])
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

        self.user.email_user(subject, message, settings.DEFAULT_FROM_EMAIL)


class ViewShareRegistrationProfile(ModeratedRegistrationProfile):


    class Meta:
        abstract=False

    organization = models.CharField(_("Organization"),
                                    max_length=100,
                                    null=False,
                                    blank=False)

    org_type = models.CharField(_("Organization Type"),
                                    max_length=100,
                                    null=False,
                                    blank=False)

    org_state = USStateField(_("Organization State"), blank=True)

    reason = models.TextField(_("Reason for joining"))
