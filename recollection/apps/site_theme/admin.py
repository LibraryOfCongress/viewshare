from django.contrib import admin
from recollection.apps.site_theme.models import SiteTheme, Skin

class SiteThemeAdmin(admin.ModelAdmin):
    list_display   = ('name', 'description')
    search_fields  = ('name', 'description',)

admin.site.register(SiteTheme, SiteThemeAdmin)
admin.site.register(Skin)
