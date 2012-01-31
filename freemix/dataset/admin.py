from django.contrib import admin
from . import models

def make_json_data_inline(m):
    class JSONDataFileInline(admin.TabularInline):
        model=m
    return JSONDataFileInline

class DatasetAdmin(admin.ModelAdmin):
    inlines = (make_json_data_inline(models.DatasetProfile),
               make_json_data_inline(models.DatasetJSONFile),
               make_json_data_inline(models.DatasetPropertiesCache)
        )
    list_display   = ('slug','owner',)
    search_fields  = ('slug','title', 'description','owner__username')
admin.site.register(models.Dataset, DatasetAdmin)

class TransactionInline(admin.TabularInline):
    model = models.DataSourceTransaction

class DataSourceAdmin(admin.ModelAdmin):
    inlines=[TransactionInline]