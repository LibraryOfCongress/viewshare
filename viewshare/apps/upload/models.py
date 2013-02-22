from os.path import join, sep
from django.core.files.storage import FileSystemStorage
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.translation import ugettext_lazy as _

from freemix.dataset.models import (DataSource,
                                    URLDataSourceMixin,
                                    make_file_data_source_mixin)
from freemix.dataset.transform import AkaraTransformClient
from viewshare.apps.upload import conf


def source_upload_path(instance, filename):
    return join(instance.uuid, filename)


class ViewshareFileStorage(FileSystemStorage):

    def url(self, name):
        uuid, filename = name.split(sep)
        return reverse("file_datasource_file_url",
            kwargs={"uuid": uuid, "filename": filename})


fs = ViewshareFileStorage(location=conf.FILE_UPLOAD_PATH)

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

class JSONDataSource(URLDataSourceMixin, DataSource):
    """Load JSON from a URL
    """
