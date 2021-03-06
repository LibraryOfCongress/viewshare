from django.db import models
from django_extensions.db.fields import UUIDField
from django_extensions.db.models import TimeStampedModel
from viewshare.apps.exhibit.models import PublishedExhibit


class SharedExhibitKey(TimeStampedModel,models.Model):

    slug = UUIDField(version=4)

    label = models.TextField(max_length=255, blank=True, null=True, help_text="An optional descriptive label")

    exhibit = models.ForeignKey(PublishedExhibit, related_name="shared_keys")

    @models.permalink
    def get_absolute_url(self):
        return ('shared_exhibit_display', (), {
            'slug': self.slug,
        })


