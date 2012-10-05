from django.contrib import admin

from viewshare.discover.models import CuratedExhibit, CuratedExhibitCollection


class CuratedExhibitAdmin(admin.TabularInline):
    """
    Admin for a CuratedExhibit
    """
    model = CuratedExhibit
    raw_id_fields = ['exhibit']
    fields = ['exhibit', 'custom_title', 'publish_date', 'position']
    extra = 0


class CuratedExhibitCollectionAdmin(admin.ModelAdmin):
    """
    Admin for a CuratedExhibitCollection
    """
    prepopulated_fields = {'slug': ['name']}
    inlines = [CuratedExhibitAdmin]


admin.site.register(CuratedExhibitCollection, CuratedExhibitCollectionAdmin)
