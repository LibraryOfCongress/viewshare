from django.db import models

from curation.models import CuratedGroup, CuratedItem
from curation.fields import CuratedForeignKey

from freemix.exhibit.models import Exhibit


class CuratedExhibitCollection(CuratedGroup):
    """
    Represents a collection of CuratedExhibits
    """
    class Meta:
        verbose_name = 'Curated Exhibit Collection'
        verbose_name_plural = 'Curated Exhibit Collections'


class CuratedExhibit(CuratedItem):
    """
    Allows a user to select an Exhibit and set attributes without modifying
    the Exhibit iteself. Useful for featuring Exhibits.
    """
    custom_title = models.CharField(max_length=255, blank=True)
    publish_date = models.DateTimeField(blank=True, null=True)
    collection = models.ForeignKey(CuratedExhibitCollection)
    exhibit = CuratedForeignKey(Exhibit)

    field_overrides = {'title': 'custom_title'}

    def __unicode__(self):
        return self.custom_title
