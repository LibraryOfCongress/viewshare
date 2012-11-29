from django.contrib import admin
from viewshare.apps.site_theme.models import SiteTheme, Skin

class SiteThemeAdmin(admin.ModelAdmin):
    list_display   = ('name', 'description')
    search_fields  = ('name', 'description',)

class SkinThemeAdmin(admin.ModelAdmin):
    list_display  = ('site', 'theme',)

admin.site.register(SiteTheme, SiteThemeAdmin)

admin.site.register(Skin, SkinThemeAdmin)
