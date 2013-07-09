from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils.translation import ugettext_lazy as _
from django.template.loader import render_to_string
from django_extensions.db.fields import AutoSlugField, UUIDField
from django_extensions.db.fields.json import JSONField
from django_extensions.db.models import TitleSlugDescriptionModel, TimeStampedModel
from freemix.dataset.models import Dataset


class Canvas(TitleSlugDescriptionModel):
    location = models.CharField(_('location'), unique=True, max_length=100,
                                help_text=_("Example: 'exhibit/canvas/three-column.html'"))

    thumbnail = models.URLField(_('thumbnail'))

    enabled = models.BooleanField(_('enabled'), null=False,default=True)

    def get_html(self):
        return render_to_string(self.location, {})

    def __unicode__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Canvases"


class Exhibit(TimeStampedModel):

    profile = JSONField()
    
    dataset = models.ForeignKey(Dataset, null=True, blank=True, related_name="exhibits")

    canvas = models.ForeignKey(Canvas)

    def dataset_available(self, user):
        """True if the provided user is able to view the dataset associated with this exhibit
        """
        ds = self.dataset
        if not ds or not user.has_perm("dataset.can_view", ds):
            return False
        return True

    def update_from_profile(self, profile):
        self.profile = profile
        self.save()


class PublishedExhibit(Exhibit):

    is_public = models.BooleanField(default=True)
    owner = models.ForeignKey(User,
                                  null=True,
                                  blank=True,
                                  related_name="published_exhibits")

    title = models.CharField(_('title'), max_length=255)
    slug = AutoSlugField(_('slug'), populate_from='title')
    description = models.TextField(_('description'), blank=True, null=True)

    def natural_key(self):
        return self.owner, self.slug

    @models.permalink
    def get_absolute_url(self):
        return ('exhibit_display', (), {
            'owner': self.owner.username,
            'slug': self.slug})

    def __unicode__(self):
        return self.title

    class Meta:
        unique_together = ("slug", "owner")
        ordering = ('-modified', )


class DraftExhibit(Exhibit):

    owner = models.ForeignKey(User,
                                null=True,
                                blank=True,
                                related_name="draft_exhibits")

    uuid = UUIDField(version=4)

    parent = models.ForeignKey(PublishedExhibit,
                               null=True,
                               blank=True)

    class Meta:
        verbose_name_plural = "Exhibits"
        verbose_name = "Exhibit"
        ordering = ('-modified', )


