from django.db import models
from django_extensions.db.fields import UUIDField
from django_extensions.db.models import TimeStampedModel
from freemix.exhibit.models import Exhibit

class SharedExhibitKey(TimeStampedModel,models.Model):

    slug = UUIDField()

    label = models.TextField(max_length=255, blank=True, null=True, help_text="An optional descriptive label")

    exhibit = models.ForeignKey(Exhibit, related_name="shared_keys")

    @models.permalink
    def get_absolute_url(self):
        return ('shared_exhibit_display', (), {
            'slug': self.slug,
        })


