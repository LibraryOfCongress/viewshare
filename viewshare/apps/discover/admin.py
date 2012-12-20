from django.contrib import admin

from viewshare.apps.discover.models import CuratedExhibit, CuratedExhibitCollection


class CuratedExhibitAdmin(admin.StackedInline):
    """
    Admin for a CuratedExhibit
    """
    model = CuratedExhibit
    raw_id_fields = ['exhibit']
    fields = [
            'exhibit',
            'custom_title',
            'thumbnail',
            'publish_date'
            ]
    extra = 0


class CuratedExhibitCollectionAdmin(admin.ModelAdmin):
    """
    Admin for a CuratedExhibitCollection
    """
    prepopulated_fields = {'slug': ['name']}
    inlines = [CuratedExhibitAdmin]


admin.site.register(CuratedExhibitCollection, CuratedExhibitCollectionAdmin)
