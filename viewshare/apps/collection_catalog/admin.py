"Admin helpers for the collection catalog models"
from django.contrib import admin
from django.conf import settings

from viewshare.apps.collection_catalog.models import Topic, Collection, Project, Organization
from recollection.utils.widgets import AutocompleteAdmin
from freemix.utils import get_username


class CatalogAdmin(admin.ModelAdmin):
    class Media:
        css = {
            'all': ('%sdjango_extensions/css/jquery.autocomplete.css'%settings.STATIC_URL,)
        }
        js = (
            '%sdjango_extensions/js/jquery.js'%settings.STATIC_URL,
            '%sdjango_extensions/js/jquery.bgiframe.min.js'%settings.STATIC_URL,
            '%sdjango_extensions/js/jquery.ajaxQueue.js'%settings.STATIC_URL,
            '%sdjango_extensions/js/jquery.autocomplete.js'%settings.STATIC_URL,
        )


class TopicAdmin(CatalogAdmin):
    "Admin interface for Catalog Topics"
    list_display   = ('name', )
    search_fields  = ('name', )

    prepopulated_fields = {"slug": ("name", )}
admin.site.register(Topic, TopicAdmin)

class CollectionAdmin(AutocompleteAdmin, CatalogAdmin):
    "Admin interface for Collections"

    related_search_fields = {
        'exhibit': ('title',),
        'organizations': ('name',),
        'project': ('name',),
    }
    related_string_functions = {
        'views': lambda x: "%s (%s)" % (x.name, get_username(x.user))
    }
    prepopulated_fields = {"slug": ("name", )}
    list_display = ('name', 'description', )
    search_fields = ('name',)
    list_filter = ('project', 'organizations', 'topics', )
    filter_horizontal = ('topics',)
    fields = ('name', 'slug', 'description', 'project', 'home_page',
        'thumbnail', 'enabled', 'topics', 'organizations', 'exhibits',
        'external_view', )
admin.site.register(Collection, CollectionAdmin)

class ProjectAdmin(CatalogAdmin):
    "Admin interface for projects"
    list_display = ('name', 'description', )
    prepopulated_fields = {"slug": ("name", )}
    search_fields = ('name',)

admin.site.register(Project, ProjectAdmin)

class OrganizationAdmin(CatalogAdmin):
    "Admin interface for Organizations"
    list_display = ('name', 'description', )

    prepopulated_fields = {"slug": ("name", )}
    search_fields = ('name',)
admin.site.register(Organization, OrganizationAdmin)
