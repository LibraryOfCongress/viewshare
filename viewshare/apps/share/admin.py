from django.contrib import admin
from viewshare.apps.share.models import SharedExhibitKey

class SharedExhibitKeyAdmin(admin.ModelAdmin):
    list_display   = ('slug','label', 'exhibit',)
    search_fields  = ('slug','label', )
admin.site.register(SharedExhibitKey, SharedExhibitKeyAdmin)