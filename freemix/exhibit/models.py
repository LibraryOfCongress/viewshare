from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils.translation import ugettext_lazy as _
from django.template.loader import render_to_string
from django_extensions.db.fields.json import JSONField
from django_extensions.db.models import TitleSlugDescriptionModel, TimeStampedModel
from freemix.dataset.models import Dataset


class Canvas(TitleSlugDescriptionModel):
    location = models.CharField(_('location'), unique=True, max_length=100,
                                help_text=_("Example: 'exhibit/canvas/three-column.html'"))

    thumbnail = models.URLField(_('thumbnail'), verify_exists = False)

    enabled = models.BooleanField(_('enabled'), null=False,default=True)

    def get_html(self):
        return render_to_string(self.location, {})

    def __unicode__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Canvases"


class Theme(TitleSlugDescriptionModel, models.Model):
    url = models.URLField(_('url'), unique=False, max_length=100,
                          help_text=_("Example: '/static/exhibit/css/"
                                      "smoothness/smoothness.css'"),
                          default="/static/exhibit/css/"
                                  "smoothness/smoothness.css",
                          verify_exists=False)
    thumbnail = models.ImageField(_('thumbnail'), upload_to='view_theme/img',
                                  default="static/images/thumbnails"
                                          "/three-column/smoothness.png")
    enabled = models.BooleanField(_('enabled'), null=False, default=True)

    def __unicode__(self):
        return self.title


class Exhibit(TitleSlugDescriptionModel, TimeStampedModel):
    owner = models.ForeignKey(User, null=True, blank=True, related_name="exhibits")

    profile = JSONField()
    
    dataset = models.ForeignKey(Dataset, null=True, blank=True, related_name="exhibits")

    canvas = models.ForeignKey(Canvas)

    theme = models.ForeignKey(Theme)

    published = models.BooleanField(default=True)

    def natural_key(self):
        return self.owner, self.slug

    @models.permalink
    def get_absolute_url(self):
        return ('exhibit_display', (), {
            'owner': self.owner.username,
            'slug': self.slug})

    def __unicode__(self):
        return self.title

    def dataset_available(self, user):
        """True if the provided user is able to view the dataset associated with this exhibit
        """
        ds = self.dataset
        if not ds or not user.has_perm("dataset.can_view", ds):
            return False
        return True

    def update_from_profile(self, profile):
        self.theme = get_object_or_404(Theme, slug=profile.get("theme"))
        self.profile = profile
        self.save()

    class Meta:
        unique_together = ("slug", "owner")
        verbose_name_plural = "Exhibits"
        verbose_name = "Exhibit"
        ordering = ('-modified', )
