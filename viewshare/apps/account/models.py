import sys

from datetime import datetime

from django.db import models
from django.conf import settings
from django.contrib.auth.models import User, AnonymousUser
from django.db.models.signals import post_save
from django.utils.translation import get_language_from_request, ugettext_lazy as _

from emailconfirmation.models import EmailAddress, EmailConfirmation

from timezones.fields import TimeZoneField
from emailconfirmation.signals import email_confirmed

class Account(models.Model):
    
    user = models.ForeignKey(User, unique=True, verbose_name=_('user'))
    
    timezone = TimeZoneField(_('timezone'))
    language = models.CharField(_('language'), max_length=10, choices=settings.LANGUAGES, default=settings.LANGUAGE_CODE)
    
    def __unicode__(self):
        return self.user.username


def create_account(sender, instance=None, **kwargs):
    if instance is None:
        return
    account, created = Account.objects.get_or_create(user=instance)

post_save.connect(create_account, sender=User)


# @@@ move to emailconfirmation app?
def superuser_email_address(sender, instance=None, **kwargs):
    if instance is None:
        return
    # only run when we are in syncdb or createsuperuser to be as unobstrusive
    # as possible and reduce the risk of running at inappropriate times
    if "syncdb" in sys.argv or "createsuperuser" in sys.argv:
        defaults = {
            "user": instance,
            "verified": True,
            "primary": True,
        }
        EmailAddress.objects.get_or_create(email=instance.email, **defaults)

post_save.connect(superuser_email_address, sender=User)


class AnonymousAccount(object):
    def __init__(self, request=None):
        self.user = AnonymousUser()
        self.timezone = settings.TIME_ZONE
        if request is not None:
            self.language = get_language_from_request(request)
        else:
            self.language = settings.LANGUAGE_CODE

    def __unicode__(self):
        return "AnonymousAccount"


class PasswordReset(models.Model):

    user = models.ForeignKey(User, verbose_name=_('user'))

    temp_key = models.CharField(_('temp_key'), max_length=100)
    timestamp = models.DateTimeField(_('timestamp'), default=datetime.now)
    reset = models.BooleanField(_('reset yet?'), default=False)

    def __unicode__(self):
        return "%s (key=%s, reset=%r)" % (self.user.username, self.temp_key, self.reset)


def mark_user_active(sender, instance=None, **kwargs):
    user = kwargs.get("email_address").user
    user.is_active = True
    user.save()

email_confirmed.connect(mark_user_active, sender=EmailConfirmation)
