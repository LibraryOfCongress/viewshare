from django.db import models
from django_extensions.db.fields.json import JSONField

class JSONDataModel(models.Model):

    data =JSONField()

    class Meta:
        abstract=True