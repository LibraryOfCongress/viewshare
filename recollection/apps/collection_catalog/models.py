"Models for building the Recollection collection catalog"

from django.db import models
from freemix.freemixprofile.models import Freemix
from django.utils.translation import ugettext_lazy as _

class CatalogModel(models.Model):
    "The base set of properties for catalog models"

    name = models.CharField(_('name'),
            max_length=100,
            null=False,
            blank=False)

    slug = models.SlugField(_('slug'),
            max_length=100,
            unique=True)

    description = models.TextField(_('description'),
            null=True,
            blank=True)

    @models.permalink
    def get_absolute_url(self):
        "URL's should reverse to '<class>_resource'"
        reverse_url = "%s_resource" % self.__class__.__name__.lower()
        return (reverse_url, (), {'slug': self.slug})

    def __unicode__(self):
        return self.name

    class Meta:
        abstract = True

class Organization(CatalogModel):
    "A participating organization corresponding to an NDIIPP partner"

    location = models.CharField(_('location'),
            max_length=30,
            null=True,
            blank=True,
            help_text="Expects Latitude, Longitude.&nbsp;&nbsp;"
                      "Example: <em>38.8951118, -77.0363658</em><br/>"
                      "See <a href='http://www.getlatlon.com/'"
                      "target='_'>http://www.getlatlon.com/</a> to pick from "
                      "a map.")

class Project(CatalogModel):
    "A recollection project"

class Topic(CatalogModel):
    "A fixed set of simple tags that indicate the topic of a collection"


class Collection(CatalogModel):
    "a list of data views that are associated with a particular project"

    home_page = models.URLField(_('home page'), verify_exists=False)

    thumbnail = models.ImageField(_('thumbnail'),
            upload_to='catalog/thumbnails',
            null=True,
            blank=True,
            help_text="Suggested image width: <em>200px</em>")

    project = models.ForeignKey(Project,
            null=False)

    topics = models.ManyToManyField(Topic,
            verbose_name="Topics",
            null=False,
            blank=False)

    enabled = models.BooleanField(_('enabled'),
            null=False,
            default=True)

    views = models.ManyToManyField(Freemix,
            verbose_name="Views",
            null=False,
            blank=True)

    organizations = models.ManyToManyField(Organization,
            verbose_name="Organizations")

    external_view = models.URLField(_('external view'),
            null=True,
            blank=True,
            verify_exists=False)

    class Meta:
        verbose_name_plural = "Collections"
