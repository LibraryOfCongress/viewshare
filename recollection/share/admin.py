from django.contrib import admin
from freemix.dataset.admin import DatasetAdmin
from recollection.share.models import SharedExhibitKey

class SharedExhibitKeyAdmin(admin.ModelAdmin):
    list_display   = ('slug','label', 'exhibit',)
    search_fields  = ('slug','label', )
admin.site.register(SharedExhibitKey, SharedExhibitKeyAdmin)