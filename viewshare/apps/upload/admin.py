from django.contrib import admin
from . import models


class URLDataSourceAdmin(admin.ModelAdmin):
    list_display = ('url',)


class FileDataSourceAdmin(admin.ModelAdmin):
    list_display = ('file',)


class OAIDataSourceAdmin(admin.ModelAdmin):
    list_display = ('title',)

class ReferenceDataSourceAdmin(admin.ModelAdmin):
    list_display = ('referenced',)

admin.site.register(models.URLDataSource, URLDataSourceAdmin)
admin.site.register(models.FileDataSource, FileDataSourceAdmin)
admin.site.register(models.ContentDMDataSource, URLDataSourceAdmin)
admin.site.register(models.ModsFileDataSource, FileDataSourceAdmin)
admin.site.register(models.ModsURLDataSource, URLDataSourceAdmin)
admin.site.register(models.OAIDataSource, OAIDataSourceAdmin)
admin.site.register(models.ReferenceDataSource, ReferenceDataSourceAdmin)
admin.site.register(models.JSONFileDataSource, FileDataSourceAdmin)
admin.site.register(models.JSONURLDataSource, URLDataSourceAdmin)