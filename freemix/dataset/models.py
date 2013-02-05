from datetime import datetime, timedelta
import logging
import urllib2
import uuid
from django.contrib.auth.models import User
from django.db.models import permalink
from django_extensions.db.fields import UUIDField
from django.db.models import signals

from django.conf import settings
from django.db import models, transaction as db_tx
from django_extensions.db.fields.json import JSONField
from django_extensions.db.models import TimeStampedModel, TitleSlugDescriptionModel
from freemix.dataset.transform import AKARA_TRANSFORM_URL
from freemix.dataset.transform import AkaraTransformClient
from freemix.models import JSONDataModel

logger = logging.getLogger(__name__)



class Dataset(TitleSlugDescriptionModel, TimeStampedModel):
    """
    A dataset consists of an Exhibit JSON document along with an accompanying
    profile that describes the properties contained in each record in a format
    that the exhibit builder can ingest
    """
    owner = models.ForeignKey(User, null=True, related_name="datasets")
    published = models.BooleanField(default=True)

    class Meta:
        unique_together=("slug", "owner")
        verbose_name_plural = "Data Sets"
        verbose_name = "Data Set"
        ordering = ('-modified', )

    def __unicode__( self ):
        return self.title

    def natural_key(self):
        return [self.owner,self.title]

    @permalink
    def get_absolute_url(self):
        return ("dataset_summary",  (), {
            'owner': self.owner.username,
            'slug': self.slug})

    @permalink
    def get_data_url(self):
        return ("dataset_data_json",  (), {
                    'owner': self.owner.username,
                    'slug': self.slug})
    @permalink
    def get_properties_url(self):
        return ("dataset_properties_cache_json",  (), {
                    'owner': self.owner.username,
                    'slug': self.slug})

    def update_data(self, json):
        data,created = DatasetJSONFile.objects.get_or_create(dataset=self, defaults={'data': json})
        if not created:
            data.data = json
        data.save()

    def update_profile(self, json):
        profile,created = DatasetProfile.objects.get_or_create(dataset=self, defaults={'data': json})
        if not created:
            profile.data = json
        profile.save()


class DatasetJSONFile(JSONDataModel):
    """
    The data associated with this dataset in the Exhibit JSON format
    """
    dataset = models.OneToOneField(Dataset, related_name="data")


class DatasetProfile(JSONDataModel):
    """
    A JSON document representing the properties defined in the dataset
    """
    dataset = models.OneToOneField(Dataset, related_name="profile")



class DatasetPropertiesCache(JSONDataModel):
    """
    An exhibit compatible representation of the properties defined in DatasetProfile.

    This is a temporary duplication of the data in DatasetProfile.  The property definitions
    need to be harmonized with what exhibit expects.
    """

    dataset = models.OneToOneField(Dataset, related_name="properties_cache")


def sync_properties(sender, instance=None, **kwargs):
    # convert freemix properties to exhibit properties
    if instance is None:
        return
    profile = instance.data
    result = {}
    for prop in profile["properties"]:
        type = "text"
        for tag in prop["tags"]:
            if tag.startswith("property:type=") and not tag=="property:type=shredded_list":
                type = tag[len("property:type="):]

        result[prop["property"]] = {
            "label": prop["label"],
            "valueType": type

        }

    property_cache,created = DatasetPropertiesCache.objects.get_or_create(dataset=instance.dataset, defaults={'data': result})
    if not created:
        property_cache.data = {"properties": result}
    property_cache.save()

signals.post_save.connect(sync_properties, sender=DatasetProfile)


class DataSource(TimeStampedModel):
    """
    This class should be extended to define the source from which the data in Datasets are derived.

    Extending subclasses should include any variable parameters that define a dataset.  In addition,
    they should override the `refresh()` method to simply perform the data generation and return the result.

    """
    classname = models.CharField(max_length=32, editable=False, null=True)

    owner = models.ForeignKey(User, null=True, blank=True, related_name="data_sources")

    dataset = models.OneToOneField(Dataset, null=True, blank=True, related_name="source")

    uuid = UUIDField()

    def get_concrete(self):
        if self.classname == "DataSource":
            return self
        return self.__getattribute__(self.classname.lower())

    def is_concrete(self):
        return self.classname == self.__class__.__name__

    def __unicode__(self):
        return self.classname + " " + self.uuid

    def create_transaction(self):
        tx = DataSourceTransaction(source=self)
        tx.save()
        return tx

    def refresh(self):
        return None

    def save(self, *args, **kwargs):
        if self.classname is None:
            self.classname = self.__class__.__name__
        super(DataSource, self).save(*args, **kwargs)

    def is_expired(self):
        return self.modified < (datetime.now() - TRANSACTION_LIFESPAN) \
            and self.dataset is None


class TransformMixin(models.Model):
    """
    Contains the methods and parameters necessary to create a simple data
     source that posts to a service and returns the result
    """

    transform = AkaraTransformClient(AKARA_TRANSFORM_URL)

    class Meta:
        abstract=True

    def get_transform_params(self):
        return {}

    def get_transform_body(self):
        return None

    def refresh(self):
        return self.transform(body=self.get_transform_body(), params=self.get_transform_params())



class URLDataSourceMixin(TransformMixin, models.Model):

    url = models.URLField(verify_exists=False)

    class Meta:
        abstract=True

    def get_transform_body(self):
        r = urllib2.urlopen(self.url)
        return r.read()

    def __unicode__(self):
        return self.url


def make_file_data_source_mixin(storage, upload_to):
    """Generate a mixin for a file based data source allowing for custom storage and file path.

        storage -- A django FileStorage implementation
        upload_to -- the default path for an uploaded file
    """
    class FileDataSourceMixin(TransformMixin, models.Model):
        file = models.FileField(storage=storage, upload_to=upload_to, max_length=255)
        class Meta:
            abstract=True

        def get_transform_body(self):
            return self.file.read()

        def __unicode__(self):
            return self.file.name
    return FileDataSourceMixin

def parse_profile_json(owner, contents, published=True):
    profile = contents.get("data_profile")
    title = profile.get("label", str(uuid.uuid4()))
    description = profile.get("description", None)

    with db_tx.commit_on_success():
        ds = Dataset.objects.create(owner=owner,
                published=published,
                title=title,
                description=description)
        ds.update_data({"items": contents.get("items", [])})
        ds.update_profile( {"properties": profile["properties"]})


    return ds

#------------------------------------------------------------------------------#

TX_STATUS = {
    "pending": 1,
    "scheduled": 2,
    "running": 3,
    "success": 4,
    "failure": 5,
    "cancelled": 6,
    "completed": 7
}


TRANSACTION_LIFESPAN = getattr(settings, "TRANSACTION_EXPIRATION_INTERVAL",
                                          timedelta(hours=24))

class DataSourceTransaction(TimeStampedModel):
    """Stores the the status and raw result of a remote data transaction for a
       particular data source.

       This implementation is temporary, to be replaced with a solution with
       pluggable backends.
    """
    tx_id = UUIDField()

    status = models.IntegerField(choices=[(v,k) for k,v in TX_STATUS.iteritems()],
                                 default=TX_STATUS["pending"])

    source = models.ForeignKey(DataSource, related_name="transactions")

    result = JSONField(null=True, blank=True)


    def is_expired(self):
        return self.modified < (datetime.now() - TRANSACTION_LIFESPAN)

    @models.permalink
    def get_absolute_url(self):
        return ('datasource_transaction', (), {
            "tx_id": self.tx_id
        })

    def validate(self):
        if not len(self.result.get("items", [])):
            self.status = TX_STATUS["failure"]
            self.result = {"message": "No Data"}
            return False

        self.status = TX_STATUS["success"]
        return True

    def run(self):
        with db_tx.commit_manually():
            try:
                source = self.source.get_concrete()
                self.result = source.refresh()
                self.validate()
            except Exception as ex:

                logger.error("Error for transaction %s: %s"%(self.tx_id, ex.message))
                self.status=TX_STATUS["failure"]
                self.result = {"message": "Error transforming data: %s"%ex.message}

            self.save()

            db_tx.commit()

        return self
