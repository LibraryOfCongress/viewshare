from datetime import timedelta, datetime
from urllib2 import URLError
import json

from django.conf import settings
from django.db import models
from django.db.models import Q
from django_extensions.db.fields import UUIDField
from django_extensions.db.models import TitleSlugDescriptionModel
from django.utils.translation import ugettext_lazy as _
from viewshare.apps.augment import conf
from viewshare.apps.exhibit.models import (DataTransaction,
                                           ExhibitProperty,
                                           PropertyData)
from viewshare.apps.exhibit.serializers import (ExhibitPropertySerializer,
                                                serializer_class_keys)
from viewshare.apps.upload.transform import AkaraTransformClient


UNSAVED_DATASOURCE_LIFESPAN = getattr(settings, "UNSAVED_DATASOURCE_LIFESPAN",
                                      timedelta(hours=24))


class ListPattern(TitleSlugDescriptionModel):
    type = models.CharField(_('type'), max_length=30)
    pattern = models.CharField(_('pattern'), max_length=100)

    @classmethod
    def to_dict(cls):
        result = {}
        for pattern in cls.objects.all():
            result[pattern.slug] = {"title": pattern.title,
                                    "type": pattern.type,
                                    "description": pattern.description,
                                    "pattern": pattern.pattern}
        return result


class AugmentationErrorCode(models.Model):
    error = models.CharField(_('error'), max_length=100)
    url = models.URLField(_('url'))

    @classmethod
    def to_dict(cls):
        result = {}
        for error in cls.objects.all():
            result[error.error] = error.url
        return result


def list_patterns():
    result = {}
    for pattern in ListPattern.objects.all():
        result[pattern.slug] = {"title": pattern.title, "type":
                                pattern.type, "description":
                                pattern.description, "pattern":
                                pattern.pattern}
    return result


class AugmentTransaction(DataTransaction):
    """
    Transaction that deals with the status of an uploading/parsing DataSource
    """
    tx_id = UUIDField(version=4)

    property = models.ForeignKey(ExhibitProperty)

    #This field is redundant and exists to ensure that the transaction is
    #deleted when the data file is deleted.
    data = models.ForeignKey(PropertyData, null=True, blank=True)

    def get_augmentation_profile(self):
        """
        Prepares the data profile document for data augmentation of a
        particular property
        """
        prop = self.property.get_concrete()

        serializer_class = serializer_class_keys[prop.classname]
        serializer = serializer_class(prop.exhibit, prop.name,
                                      instance=prop, draft=True)

        properties = {prop.name: serializer.data}
        related = prop.get_related_properties()
        for p in related:
            serializer = ExhibitPropertySerializer(prop.exhibit,
                                                   p.name,
                                                   instance=p,
                                                   draft=False)
            properties.update({p.name: serializer.data})

        q = Q(exhibit_property_id__in=[p.id for p in related])
        data = PropertyData.objects.filter(q)

        records = {}

        for property_data in data.all():
            prop = property_data.exhibit_property.name
            for item in property_data.json:
                key = (item["id"], item["label"])
                record = records.get(key, None)
                if not record:
                    record = {"id": item["id"], "label": item["label"]}
                    records[key] = record
                record[prop] = item[prop]
        return {
            "properties": properties,
            "data_profile": self.new_data_profile_to_legacy(properties),
            "items": [records[key] for key in records.keys()]
        }

    @models.permalink
    def get_absolute_url(self):
        """
        Return a URL to get status updates about this transaction
        """
        owner = self.property.exhibit.owner.username
        slug = self.property.exhibit.slug
        prop_name = self.property.name
        return ('draft_exhibit_property_status', (), {
            'owner': owner,
            'slug': slug,
            'property': prop_name
        })

    def is_expired(self):
        return self.modified < (datetime.now() - UNSAVED_DATASOURCE_LIFESPAN)

    def start_transaction(self):
        """
        Start the asynchronous task for this transaction.
        """
        from .tasks import augment_property
        augment_property.delay(self.id)

    def do_run(self):
        """
        POSTs the augmentation profile and parses the response into
        PropertyData and failures
        """

        transform = AkaraTransformClient(conf.AKARA_AUGMENT_URL)

        profile = self.get_augmentation_profile()
        items = []
        p = self.property
        try:
            result = transform(body=json.dumps(profile))
            items = result.get("items", [])

            message = {}
            failures = result.get("failures", [])
            if len(failures) > 0:
                message.update({"failures": failures})

            if len(items) > 0:
                self.success(message or None)
            else:
                message.update({"message": "No data"})
                self.failure(message)
        except URLError:
            self.failure("Connection Refused: Akara is not responding.")
            raise
        except ValueError:
            self.failure("Invalid response body")
            raise
        except Exception, ex:
            self.failure(repr(ex))
        PropertyData.objects.filter(exhibit_property=p).delete()
        data = PropertyData.objects.create(exhibit_property=p,
                                           json=items)
        self.data = data
        self.save()

    @staticmethod
    def new_data_profile_to_legacy(profile):
        """
        Convert an exhibit property document to the old style
        data profile for data augmentation
        TODO: Remove this when akara supports the old version
        """
        result = []
        for prop in profile.keys():
            old_record = profile[prop]
            new_record = {
                "enabled": True,
                "label": old_record["label"],
                "property": prop,
                "tags": [
                    "property:type=%s" % old_record["valueType"]
                ]
            }
            if "augmentation" in old_record.keys():
                record_type = old_record["augmentation"]
                if record_type == "composite":
                    new_record["composite"] = old_record["composite"]
                elif record_type == "delimited-list":
                    new_record["delimiter"] = old_record["delimiter"]
                    new_record["tags"].append("property:type=shredded_list")
                    new_record["extract"] = old_record["source"]
                elif record_type == "pattern-list":
                    new_record["pattern"] = old_record["pattern"]
                    new_record["tags"].append("property:type=shredded_list")
                    new_record["extract"] = old_record["source"]
            result.append(new_record)
        return {"properties": result}
