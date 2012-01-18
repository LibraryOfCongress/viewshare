from datetime import datetime, timedelta
import logging
import urllib2
import uuid
from django.contrib.auth.models import User
from django.db.models import permalink
from django_extensions.db.fields import UUIDField

from django.conf import settings
from django.db import models, transaction as db_tx
from django_extensions.db.fields.json import JSONField
from django_extensions.db.models import TimeStampedModel, TitleSlugDescriptionModel
from freemix.dataset.transform import AKARA_TRANSFORM_URL
from freemix.dataset.transform import AkaraTransformClient

logger = logging.getLogger(__name__)

# At some point, we need to migrate the freemix profile to use the exhibit
# format for properties, but for now, maintain a separate field
def synchronize_properties_cache(profile):
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
    return {"properties": result}


class Dataset(TitleSlugDescriptionModel, TimeStampedModel):
    owner = models.ForeignKey(User, null=True, related_name="datasets")

    published = models.BooleanField(default=True)

    profile = JSONField(default='{"properties": []}')

    properties_cache = JSONField(default='{"properties": {}}')

    data = JSONField(default='{"items": []}')

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

    def save(self, force_insert=False, force_update=False, using=None):

        # Kludge in advance of collapsing freemix and exhibit property descriptions into one entity
        self.properties_cache = synchronize_properties_cache(self.profile)

        super(Dataset, self).save(force_insert, force_update, using)






class DataSource(TimeStampedModel):
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

    def create_transaction(self, user):
        tx = DataSourceTransaction(source=self)
        tx.save()
        return tx

    def save(self, *args, **kwargs):
        if self.classname is None:
            self.classname = self.__class__.__name__
        super(DataSource, self).save(*args, **kwargs)




class TransformMixin(models.Model):
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
    data = {"items": contents.get("items", [])}
    profile = {"properties": profile["properties"]}
    properties_cache = synchronize_properties_cache(profile)
    ds = Dataset.objects.create(owner=owner,
                published=published,
                title=title,
                description=description,
                profile=profile,
                data=data,
                properties_cache=properties_cache)


    return ds

#------------------------------------------------------------------------------#

TX_STATUS = {
    "pending": 1,
    "scheduled": 2,
    "running": 3,
    "success": 4,
    "failure": 5,
    "cancelled": 6
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
        if self.status != TX_STATUS["pending"]:
            raise

        with db_tx.commit_manually():
            self.status=TX_STATUS["running"]
            self.save()

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
