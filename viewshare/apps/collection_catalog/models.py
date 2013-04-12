"""
Models for building the Viewshare collection catalog
"""

from django.db import models
from django.utils.translation import ugettext_lazy as _
from freemix.utils import get_site_url
from freemix.exhibit.models import Exhibit


class CatalogModel(models.Model):
    """
    The base set of properties for catalog models"
    """

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
        return reverse_url, (), {'slug': self.slug}

    def __unicode__(self):
        return self.name

    def to_dict(self):
        """
        returns a dict appropriate for use in an Exhibit JSON document
        :return: An dict that defines at least id, type and label
        """
        d = {
            "id": get_site_url(self.get_absolute_url()),
            "type": self.__class__.__name__,
            "label": self.name,
            "slug": self.slug
        }
        if self.description is not None and len(self.description) > 0:
            d["slug"] = self.slug
        return d

    class Meta:
        abstract = True


class Organization(CatalogModel):
    "A participating organization corresponding to an NDIIPP partner"

    location = models.CharField(_('location'),
                                max_length=30,
                                null=True,
                                blank=True,
                                help_text="Expects Latitude, Longitude.&nbsp;"
                                          "&nbsp;Example: <em>38.8951118, "
                                          "-77.0363658</em><br/>See "
                                          "<a href='http://www.getlatlon.com/'"
                                          "target='_'>"
                                          "http://www.getlatlon.com/"
                                          "</a> to pick from a map.")

    def to_dict(self):
        d = super(Organization, self).to_dict()
        if self.location is not None and len(self.location) > 0:
            d["location"] = self.location
        return d


class Project(CatalogModel):
    "A Viewshare project"


class Topic(CatalogModel):
    "A fixed set of simple tags that indicate the topic of a collection"


class Collection(CatalogModel):
    "a list of data views that are associated with a particular project"

    home_page = models.URLField(_('home page'), verify_exists=False)

    thumbnail = models.ImageField(_('thumbnail'),
                                  upload_to='catalog/thumbnails',
                                  null=True,
                                  blank=True,
                                  help_text="Suggested image width: "
                                            "<em>200px</em>")

    project = models.ForeignKey(Project,
                                null=False)

    topics = models.ManyToManyField(Topic,
                                    verbose_name="Topics",
                                    null=False,
                                    blank=False)

    enabled = models.BooleanField(_('enabled'),
                                  null=False,
                                  default=True)

    exhibits = models.ManyToManyField(Exhibit,
                                      verbose_name="Exhibits",
                                      null=False,
                                      blank=True)

    organizations = models.ManyToManyField(Organization,
                                           verbose_name="Organizations")

    external_view = models.URLField(_('external view'),
                                    null=True,
                                    blank=True,
                                    verify_exists=False)

    def to_dict(self):
        d = super(Collection, self).to_dict()
        d["project"] = get_site_url(self.project.get_absolute_url())

        if self.thumbnail:
            d["thumbnail"] = self.thumbnail.url

        d["home_page"] = self.home_page

        d["topics"] = [get_site_url(t.get_absolute_url())
                       for t in self.topics.iterator()]

        d["exhibits"] = [get_site_url(exhibits.get_absolute_url())
                         for exhibits in self.exhibits.iterator()]

        d["organizations"] = [get_site_url(t.get_absolute_url())
                              for t in self.organizations.iterator()]

        if self.external_view:
            d["exhibits"].append(self.external_view)

        return d

    class Meta:
        verbose_name_plural = "Collections"
