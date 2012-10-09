from datetime import datetime

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


class CuratedExhibitManager(models.Manager):
    """
    A Manager that defines custom querysets on a CuratedExhibit
    """
    def live(self, collection_slug):
        """
        Select all the CuratedExhibits that have a publish_date in the past
        for a given 'colection_slug'
        """
        exhibits = self.filter(collection__slug=collection_slug)\
                .filter(publish_date__lte=datetime.now())\
                .order_by('-publish_date')
        return exhibits


class CuratedExhibit(CuratedItem):
    """
    Allows a user to select an Exhibit and set attributes without modifying
    the Exhibit iteself. Useful for featuring Exhibits.
    """
    custom_title = models.CharField(max_length=255, blank=True)
    publish_date = models.DateTimeField(blank=True, null=True)
    collection = models.ForeignKey(CuratedExhibitCollection)
    exhibit = CuratedForeignKey(Exhibit)

    objects = CuratedExhibitManager()
    field_overrides = {'title': 'custom_title'}

    def __unicode__(self):
        return self.custom_title
