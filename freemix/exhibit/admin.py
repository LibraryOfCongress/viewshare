from django.contrib import admin
from freemix.exhibit import models


class CanvasAdmin(admin.ModelAdmin):
    list_display = ('title', 'description')
    search_fields = ('title', 'description',)

admin.site.register(models.Canvas, CanvasAdmin)


class DraftExhibitAdmin(admin.ModelAdmin):
    list_display = ('slug', 'owner',)
    search_fields = ('owner__username', )

admin.site.register(models.DraftExhibit, DraftExhibitAdmin)


class PublishedExhibitAdmin(admin.ModelAdmin):
    list_display = ('slug', 'owner',)
    search_fields = ('slug', 'title', 'description', 'owner__username')

admin.site.register(models.PublishedExhibit, PublishedExhibitAdmin)
