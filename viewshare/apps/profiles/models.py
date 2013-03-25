from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.utils.translation import ugettext_lazy as _


class Profile(models.Model):

    user = models.ForeignKey(User,
                             unique=True,
                             verbose_name=_('user'),
                             related_name="profile")

    about = models.TextField(_('about'), null=True, blank=True)

    location = models.CharField(_('location'),
                                max_length=40,
                                null=True,
                                blank=True)

    website = models.URLField(_('website'),
                              null=True,
                              blank=True,
                              verify_exists=False)

    organization = models.CharField(_("Organization"),
                                    max_length=100,
                                    null=True,
                                    blank=True)

    org_type = models.CharField(_("Organization Type"),
                                max_length=100,
                                null=True,
                                blank=True)

    def __unicode__(self):
        return self.user.username

    def get_absolute_url(self):
        return 'profile_detail', None, {'username': self.user.username}
    get_absolute_url = models.permalink(get_absolute_url)

    class Meta:
        verbose_name = _('profile')
        verbose_name_plural = _('profiles')


def create_profile(sender, instance=None, **kwargs):
    if instance is None:
        return
    profile, created = Profile.objects.get_or_create(user=instance)

post_save.connect(create_profile, sender=User)

# Disable the creation of the superuser account on initial syncdb,
# as the profile model is managed by South

from django.contrib.auth import models as auth_app
from django.contrib.auth.management import create_superuser

from django.db.models import signals


signals.post_syncdb.disconnect(create_superuser,
                               sender=auth_app,
                               dispatch_uid='django.contrib.auth.'
                                            'management.create_superuser')
