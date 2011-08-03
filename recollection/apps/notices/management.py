from django.conf import settings
from django.db.models import signals
from django.utils.translation import ugettext_noop as _

if "notification" in settings.INSTALLED_APPS:

    from notification import models as notification
    if 'avatar' in settings.INSTALLED_APPS:
        from avatar.management import create_notice_types as av_mbnt
        signals.post_syncdb.disconnect(av_mbnt, sender=notification)

