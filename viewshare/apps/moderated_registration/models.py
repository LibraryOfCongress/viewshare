import random
import hashlib
from django.conf import settings
from django.contrib.auth.models import User

from django.contrib.sites.models import Site
from django.db import models, transaction
from django.template.loader import render_to_string
from django_extensions.db.fields import AutoSlugField
from django.utils.translation import ugettext_lazy as _

from registration.models import RegistrationProfile, RegistrationManager

from django.core.mail import send_mail


class OrganizationType(models.Model):
    value = models.CharField(max_length=100, unique=True)
    key = AutoSlugField(populate_from="value")


class ModeratedRegistrationManager(RegistrationManager):

    @transaction.commit_on_success
    def create_moderated_user(self, *args, **kwargs):
        username = kwargs["username"]
        password = kwargs["password1"]
        email = kwargs["email"]

        new_user = User.objects.create_user(username, email, password)
        new_user.is_active = False
        new_user.save()

        profile = new_user.get_profile()

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

    def approve_profile(self, profile):
        profile.is_approved = True
        self.send_activation(profile)

    def reject_profile(self, profile):

        profile.user.delete()
        return False

    def send_activation(self, profile):
        """
        Generate an activation key for a profile that has been moderator
        approved
        """

        if profile.is_approved and not profile.user.is_active:
            salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
            user_hash = hashlib.sha1(salt + profile.user.username)
            profile.activation_key = user_hash.hexdigest()
            profile.save()

            current_site = Site.objects.get_current()

            profile.send_activation_email(current_site)

        return False


class ModeratedRegistrationProfile(RegistrationProfile, models.Model):
    PENDING = "Pending Moderation"

    objects = ModeratedRegistrationManager()

    is_approved = models.BooleanField(_("approved"), default=False)

    class Meta:
        abstract = True

    def send_approval_email(self, site):
        ctx_dict = {
            'profile': self,
            'SITE_NAME': settings.SITE_NAME,
            'CONTACT_EMAIL': settings.CONTACT_EMAIL,
        }

        subject = render_to_string('registration/approval_email_subject.txt',
                                   ctx_dict)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())

        message = render_to_string('registration/approval_email.txt',
                                   ctx_dict)
        from_addr = settings.DEFAULT_FROM_EMAIL

        to = getattr(settings,
            "USER_APPROVAL_EMAIL_LIST",
            [settings.CONTACT_EMAIL])

        send_mail(subject, message, from_addr, to)

    def send_activation_email(self, site):
        """
        Overrides the base method to add the profile itself to the
        activation templates

        """
        ctx_dict = {'activation_key': self.activation_key,
                    'expiration_days': settings.ACCOUNT_ACTIVATION_DAYS,
                    'site': site,
                    'profile': self,
                    'SITE_NAME': settings.SITE_NAME,
                    'CONTACT_EMAIL': settings.CONTACT_EMAIL}

        subject = render_to_string('registration/activation_email_subject.txt',
                                   ctx_dict)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())

        message = render_to_string('registration/activation_email.txt',
                                   ctx_dict)
        from_addr = settings.DEFAULT_FROM_EMAIL

        send_mail(subject, message, from_addr, [self.user.email])


class ViewShareRegistrationProfile(ModeratedRegistrationProfile):

    class Meta:
        abstract = False
