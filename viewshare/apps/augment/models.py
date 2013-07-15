from django.db import models
from django_extensions.db.models import TitleSlugDescriptionModel
from django.utils.translation import ugettext_lazy as _

class ListPattern(TitleSlugDescriptionModel):
    type = models.CharField(_('type'), max_length=30)
    pattern=models.CharField(_('pattern'), max_length=100)

    @classmethod
    def to_dict(cls):
        result = {}
        for pattern in cls.objects.all():
            result[pattern.slug] = {"title": pattern.title, "type":
                                pattern.type, "description":
                                pattern.description, "pattern":
                                pattern.pattern}
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

