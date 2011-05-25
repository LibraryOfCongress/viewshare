from django.conf import settings
from django.db.models import signals
from django.utils.translation import ugettext_noop as _

if "notification" in settings.INSTALLED_APPS:

    from notification import models as notification
    if 'microblogging' in settings.INSTALLED_APPS:
        from microblogging.management import create_notice_types as mbnt
        signals.post_syncdb.disconnect(mbnt, sender=notification)


