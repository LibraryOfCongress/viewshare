from django.db import models
from django_extensions.db.fields import AutoSlugField
from django.contrib.auth.models import User
import os

class SupportPickListItem(models.Model):
    """
    Support Form item pick lists
    """
    value = models.CharField(max_length=100, unique=True)
    key = AutoSlugField(populate_from="value")
    class Meta:
        abstract=True

class BrowserPickListItem(SupportPickListItem):
    """
    An editable list of browsers for selection in recollection support tickets
    """
    pass

class FileFormatPickListItem(SupportPickListItem):
    """
    An editable list of file formats for data loading support tickets
    """
    pass

class DataLoadReasonPickListItem(SupportPickListItem):
    """
    An editable list of the reasons for creating a support ticket
    """
    pass

def source_upload_path(instance, filename):
    return os.path.join("support", "datasource", instance.user.username, filename)


class SupportFileDataSource(models.Model):
    file = models.FileField(upload_to=source_upload_path, max_length=255)
    user = models.ForeignKey(User)

    def __unicode__(self):
        return self.file.url

