from datetime import datetime, timedelta
from django.conf import settings

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

EMAIL_CONFIRMATION_DAYS = getattr(settings, "EMAIL_CONFIRMATION_DAYS", 14)


class PasswordReset(models.Model):

    user = models.ForeignKey(User, verbose_name=_('user'))

    temp_key = models.CharField(_('temp_key'), max_length=100)
    timestamp = models.DateTimeField(_('timestamp'), default=datetime.now)
    reset = models.BooleanField(_('reset yet?'), default=False)

    def __unicode__(self):
        return "%s (key=%s, reset=%r)" % (self.user.username,
                                          self.temp_key,
                                          self.reset)


class EmailConfirmation(models.Model):

    user = models.ForeignKey(User, verbose_name=_('user'))

    temp_key = models.CharField(_('temp_key'), max_length=100)
    timestamp = models.DateTimeField(_('timestamp'), default=datetime.now)
    email = models.EmailField(_('email address'))

    def __unicode__(self):
        return "%s (key=%s, email=%s)" % (
            self.user.username, self.temp_key, self.email)

    def confirm(self):
        if not self.expired():
            self.user.email = self.email
            self.user.save(update_fields=("email",))
        self.delete()

    def expired(self):
        expiration_date = self.timestamp + timedelta(
            days=settings.EMAIL_CONFIRMATION_DAYS)
        return expiration_date <= datetime.now()
    expired.boolean = True