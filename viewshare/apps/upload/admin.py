from django.contrib import admin
from . import models
from freemix.dataset.admin import DataSourceAdmin


class URLDataSourceAdmin(DataSourceAdmin):
    list_display = ('uuid', 'url',)


class FileDataSourceAdmin(DataSourceAdmin):
    list_display = ('uuid', 'file')


class OAIDataSourceAdmin(DataSourceAdmin):
    list_display = ('uuid', 'title')


admin.site.register(models.URLDataSource, URLDataSourceAdmin)
admin.site.register(models.FileDataSource, FileDataSourceAdmin)
admin.site.register(models.ContentDMDataSource, URLDataSourceAdmin)
admin.site.register(models.ModsFileDataSource, FileDataSourceAdmin)
admin.site.register(models.ModsURLDataSource, URLDataSourceAdmin)
admin.site.register(models.OAIDataSource, OAIDataSourceAdmin)
