from django.db import models
from django_extensions.db.fields import UUIDField
from django_extensions.db.models import TimeStampedModel

try:
    import uuid
    HAS_UUID = True
except ImportError:
    HAS_UUID = False

from django.core.exceptions import ImproperlyConfigured
from django.template.defaultfilters import slugify
from django.db.models import DateTimeField, CharField, SlugField

try:
    from django.utils.timezone import now as datetime_now
    assert datetime_now
except ImportError:
    import datetime
    datetime_now = datetime.datetime.now

try:
    from django.utils.encoding import force_unicode  # NOQA
except ImportError:
    from django.utils.encoding import force_text as force_unicode  # NOQA

from viewshare.apps.exhibit.models import PublishedExhibit


def base57(num):
    """
    Converts an integer into a string representation in base 57.
    Uses all alphanumerical characters that aren't visually ambiguous.
    (ie, not one of 0,O,1,l,I).

    Derived from http://code.activestate.com/recipes/65212-convert-from-decimal-to-any-base-number/#c5
    and the idea for excluding those 5 characters from `shortuuid`

    :param num:
    :return:
    """
    b = 57
    numerals = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"

    return (((num == 0) and numerals[0]) or
            (base57(num // b).lstrip(numerals[0]) + numerals[num % b]))


class Base57Field(UUIDField):
    def __init__(self, verbose_name=None, name=None, auto=True, version=4, node=None, clock_seq=None, namespace=None, **kwargs):
        super(Base57Field, self).__init__(verbose_name, name, auto, version, node, clock_seq, namespace, **kwargs)

    def create_uuid(self):
        uuid_value = base57(int(str(uuid.uuid4()).replace('-',''),16))
        return uuid_value

    def pre_save(self, model_instance, add):
        value = super(UUIDField, self).pre_save(model_instance, add)
        if self.auto and add and value is None:
            value = force_unicode(self.create_uuid())
            setattr(model_instance, self.attname, value)
            return value
        else:
            if self.auto and not value:
                value = force_unicode(self.create_uuid())
                setattr(model_instance, self.attname, value)
        return value

class SharedExhibitKey(TimeStampedModel,models.Model):

    slug = Base57Field(version=4)

    label = models.TextField(max_length=255, blank=True, null=True, help_text="An optional descriptive label")

    exhibit = models.ForeignKey(PublishedExhibit, related_name="shared_keys")

    @models.permalink
    def get_absolute_url(self):
        return ('shared_exhibit_display', (), {
            'slug': self.slug,
        })


