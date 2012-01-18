from django.contrib import admin
from freemix.dataset.models import DataSourceTransaction
from .models import Dataset

class DatasetAdmin(admin.ModelAdmin):
    list_display   = ('slug','owner',)
    search_fields  = ('slug','title', 'description','owner__username')
admin.site.register(Dataset, DatasetAdmin)

class TransactionInline(admin.TabularInline):
    model = DataSourceTransaction

class DataSourceAdmin(admin.ModelAdmin):
    inlines=[TransactionInline]