from django.contrib import admin
from . import models
from freemix.dataset.admin import DataSourceAdmin

admin.site.register(models.URLDataSource, DataSourceAdmin)
admin.site.register(models.FileDataSource, DataSourceAdmin)
admin.site.register(models.ContentDMDataSource, DataSourceAdmin)
admin.site.register(models.ModsFileDataSource, DataSourceAdmin)
admin.site.register(models.ModsURLDataSource, DataSourceAdmin)
admin.site.register(models.OAIDataSource, DataSourceAdmin)