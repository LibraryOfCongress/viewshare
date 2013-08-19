import urllib2
import json

from os.path import join, sep, basename
from django.core.files.storage import FileSystemStorage
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django_extensions.db.models import TimeStampedModel
from freemix.exhibit.models import Exhibit

from viewshare.apps.upload.transform import (AkaraTransformClient,
                                             AKARA_TRANSFORM_URL)
from viewshare.apps.upload import conf


class DataSource(TimeStampedModel):
    """
    This class should be extended to define the source from which the data in
    Datasets are derived.

    Extending subclasses should include any variable parameters that define a
    dataset.  In addition, they should override the `refresh()` method to
    simply perform the data generation and return the result.
    """
    classname = models.CharField(max_length=32, editable=False, null=True)

    exhibit = models.OneToOneField(Exhibit, related_name="source")

    def get_concrete(self):
        if self.classname == "DataSource":
            return self
        return self.__getattribute__(self.classname.lower())

    def is_concrete(self):
        return self.classname == self.__class__.__name__


class ReferenceDataSource(DataSource):
    """
    A Data Source that references another exhibit
    """

    referenced = models.ForeignKey(Exhibit,
                                   related_name="references")

def source_upload_path(instance, filename):
    return join(instance.uuid, filename)


class ViewshareFileStorage(FileSystemStorage):

    def url(self, name):
        uuid, filename = name.split(sep)
        return reverse("file_datasource_file_url",
                       kwargs={"uuid": uuid})


fs = ViewshareFileStorage(location=conf.FILE_UPLOAD_PATH)


class TransformMixin(models.Model):
    """
    Contains the methods and parameters necessary to create a simple data
     source that posts to a service and returns the result
    """

    transform = AkaraTransformClient(AKARA_TRANSFORM_URL)

    class Meta:
        abstract = True

    def get_transform_params(self):
        return {}

    def get_transform_body(self):
        return None

    def refresh(self):
        return self.transform(
                body=self.get_transform_body(),
                params=self.get_transform_params())


class URLDataSourceMixin(TransformMixin, models.Model):

    url = models.URLField()

    class Meta:
        abstract = True

    def get_transform_body(self):
        r = urllib2.urlopen(self.url)
        return r.read()

    def __unicode__(self):
        return self.url


def make_file_data_source_mixin(storage, upload_to):
    """
    Generate a mixin for a file based data source allowing for custom
    storage and file path.

        storage -- A django FileStorage implementation
        upload_to -- the default path for an uploaded file
    """
    class FileDataSourceMixin(TransformMixin, models.Model):
        file = models.FileField(
                storage=storage,
                upload_to=upload_to,
                max_length=255)

        class Meta:
            abstract = True

        def get_transform_body(self):
            return self.file.read()

        def get_filename(self):
            return basename(self.file.name)

        def __unicode__(self):
            return self.file.name
    return FileDataSourceMixin

file_datasource_mixin = make_file_data_source_mixin(storage=fs,
    upload_to=source_upload_path)


class URLDataSource(URLDataSourceMixin, DataSource):
    """Generic URL data source
    """


class FileDataSource(file_datasource_mixin, DataSource):
    """Generic File data source
    """


_collection_help_text_ = _("Collection names begin with the "
                           "<strong>/</strong> character")
_limit_help_text_ = _("The maximum number of records to load")


class ContentDMDataSource(URLDataSourceMixin, DataSource):
    """
    Data source for loading data from a particular CONTENTdm site
    based on collection name or query.
    """

    collection = models.CharField(_("Collection"),
                                  max_length=255,
                                  null=True,
                                  blank=True,
                                  help_text=_collection_help_text_)

    query = models.CharField(_("Search term"),
                             max_length=255,
                             null=True,
                             blank=True)

    limit = models.IntegerField(_("Limit"),
                                help_text=_limit_help_text_,
                                default="100",
                                choices=((100, "100"),
                                         (200, "200"),
                                         (300, "300"),
                                         (400, "400")))

    # Data transform
    transform = AkaraTransformClient(conf.AKARA_CONTENTDM_URL)

    def get_transform_params(self):
        p = {'site': self.url,
                'limit': self.limit}
        if self.collection:
            p['collection'] = self.collection
        if self.query:
            p['query'] = self.query
        return p

    def get_transform_body(self):
        return None


class OAIDataSource(URLDataSourceMixin, DataSource):
    """Data source for loading an OAI set.
    """

    set = models.CharField(_("Set"), max_length=255)

    title = models.CharField(_("Title"), max_length=255)

    limit = models.IntegerField(_("Limit"),
                            help_text=_limit_help_text_,
                            default="100",
                            choices=((100, "100"),
                                     (200, "200"),
                                     (300, "300"),
                                     (400, "400")))

    # Data transform
    transform = AkaraTransformClient(conf.AKARA_OAIPMH_URL)

    def get_transform_params(self):
        p = {'endpoint': self.url,
                'limit': self.limit,
                'oaiset': self.set}
        return p

    def get_transform_body(self):
        return None

    def __unicode__(self):
        return "%s (%s, %s)" % (self.title, self.url, self.set)


class JSONURLDataSource(URLDataSourceMixin, DataSource):
    """Load JSON from a URL
    """
    path = models.TextField(_("Items Array"))

    mapping = models.TextField(_("Property Mapping"))

    transform = AkaraTransformClient(conf.AKARA_JSON_EXTRACT_URL)

    def get_transform_body(self):
        r = urllib2.urlopen(self.url)
        part1 = r.read()
        part2 = [(json.loads(self.path), json.loads(self.mapping))]
        body = "%s\f%s" % (part1, json.dumps(part2))
        return body

    def __unicode__(self):
        return "%s (%s)" % (self.url, self.path)


class JSONFileDataSource(file_datasource_mixin, DataSource):
    """Load JSON from a file
    """
    path = models.TextField(_("Items Array"))

    mapping = models.TextField(_("Property Mapping"))

    transform = AkaraTransformClient(conf.AKARA_JSON_EXTRACT_URL)

    def get_transform_body(self):
        part1 = self.file.read()
        part2 = [(json.loads(self.path), json.loads(self.mapping))]
        body = "%s\f%s" % (part1, json.dumps(part2))
        return body

    def __unicode__(self):
        return "%s (%s)" % (self.file.name, self.path)


cdm_help_text = """
<p>For XML MODS files, %(site_name)s recognizes the most commonly
 used elements and attributes. Some XML MODS files include local extension
 elements or elements not already tested. If you suspect that some of the
 elements are not loading, click "Verify Data" to run diagnostics
 to identify elements in the file that are not recognized by %(site_name)s.
 </p>
<p>Note: Diagnostics operation will slow the upload process slightly.</p>
""" % {"site_name" : conf.SITE_NAME}


class ModsMixin(models.Model):
    """Data source for loading XMLMODS data.
    """
    diagnostics = models.BooleanField(_("Verify Data"),
                                      help_text=_(cdm_help_text))

    class Meta:
        abstract = True

    def get_transform_params(self):
        p = {}
        if self.diagnostics:
            p['diagnostics'] = "yes"
        return p


class ModsURLDataSource(ModsMixin, URLDataSourceMixin, DataSource):
    """Load XMLMODS from a URL
    """


class ModsFileDataSource(ModsMixin, file_datasource_mixin, DataSource):
    """Load XMLMODS from an uploaded file
    """
