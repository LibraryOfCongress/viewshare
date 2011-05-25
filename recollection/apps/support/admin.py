"Admin helpers for the recollection support models"
from django.contrib import admin
from . import models
from django.conf import settings

class SupportPickListAdmin(admin.ModelAdmin):
    list_display=('value',)

admin.site.register(models.BrowserPickListItem, SupportPickListAdmin)
admin.site.register(models.DataLoadReasonPickListItem, SupportPickListAdmin)
admin.site.register(models.FileFormatPickListItem, SupportPickListAdmin)
admin.site.register(models.SupportFileDataSource)
