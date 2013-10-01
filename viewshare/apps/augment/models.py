from datetime import timedelta, datetime

from django.conf import settings
from django.db import models
from django_extensions.db.fields import UUIDField
from django_extensions.db.models import TitleSlugDescriptionModel
from django.utils.translation import ugettext_lazy as _
from viewshare.apps.exhibit.models import DataTransaction, ExhibitProperty


UNSAVED_DATASOURCE_LIFESPAN = getattr(settings, "UNSAVED_DATASOURCE_LIFESPAN",
                                      timedelta(hours=24))


class ListPattern(TitleSlugDescriptionModel):
    type = models.CharField(_('type'), max_length=30)
    pattern = models.CharField(_('pattern'), max_length=100)

    @classmethod
    def to_dict(cls):
        result = {}
        for pattern in cls.objects.all():
            result[pattern.slug] = {"title": pattern.title,
                                    "type": pattern.type,
                                    "description": pattern.description,
                                    "pattern": pattern.pattern}
        return result


class AugmentationErrorCode(models.Model):
    error = models.CharField(_('error'), max_length=100)
    url = models.URLField(_('url'))

    @classmethod
    def to_dict(cls):
        result = {}
        for error in cls.objects.all():
            result[error.error] = error.url
        return result


def list_patterns():
    result = {}
    for pattern in ListPattern.objects.all():
        result[pattern.slug] = {"title": pattern.title, "type":
                                pattern.type, "description":
                                pattern.description, "pattern":
                                pattern.pattern}
    return result


class AugmentTransaction(DataTransaction):
    """
    Transaction that deals with the status of an uploading/parsing DataSource
    """
    tx_id = UUIDField(version=4)

    property = models.ForeignKey(ExhibitProperty)

    @models.permalink
    def get_absolute_url(self):
        """
        Return a URL to get status updates about this transaction
        """
        owner = self.property.exhibit.owner.username
        slug = self.property.exhibit.slug
        prop_name = self.property.name
        return ('draft_exhibit_property_status', (), {
            'owner': owner,
            'slug': slug,
            'property': prop_name
        })

    def is_expired(self):
        return self.modified < (datetime.now() - UNSAVED_DATASOURCE_LIFESPAN)

    def start_transaction(self):
        """
        Start the asyncronous task for this transaction.
        """
        from .tasks import augment_property
        augment_property.delay(self.tx_id)

    def do_run(self):
        """
        Validate, parse, and save transformed data. This data is coming
        from Akara.
        """
        source = self.source.get_concrete()
        result = source.refresh()
        if len(result.get("items", [])):
            # TODO: parse and save 'items' into new PropertyData format
            self.success()
        else:
            self.failure("No Data")
