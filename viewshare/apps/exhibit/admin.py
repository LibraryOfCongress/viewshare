from django.contrib import admin
from viewshare.apps.exhibit import models


class DraftExhibitAdmin(admin.ModelAdmin):
    list_display = ('slug', 'owner',)
    search_fields = ('owner__username', )

admin.site.register(models.DraftExhibit, DraftExhibitAdmin)


class PublishedExhibitAdmin(admin.ModelAdmin):
    list_display = ('slug', 'owner',)
    search_fields = ('slug', 'title', 'description', 'owner__username')

admin.site.register(models.PublishedExhibit, PublishedExhibitAdmin)
