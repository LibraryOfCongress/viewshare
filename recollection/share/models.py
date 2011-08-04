from django.db import models
from django_extensions.db.fields import UUIDField
from freemix.exhibit.models import Exhibit
from freemix.permissions import owner_filter, PermissionsRegistry, check_owner

class SharedExhibitKey(models.Model):

    slug = UUIDField()

    label = models.TextField(max_length=255, blank=True, null=True)

    exhibit = models.ForeignKey(Exhibit)

    @models.permalink
    def get_absolute_url(self):
        return ('shared_exhibit_display', (), {
            'slug': self.slug,
        })


PermissionsRegistry.register('exhibit.can_share', check_owner , owner_filter)

