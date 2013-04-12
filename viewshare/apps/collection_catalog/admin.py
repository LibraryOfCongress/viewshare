"Admin helpers for the collection catalog models"
from django.contrib import admin
from viewshare.apps.collection_catalog import models
from freemix.utils import get_username


class TopicAdmin(admin.ModelAdmin):
    "Admin interface for Catalog Topics"
    list_display = ('name', )
    search_fields = ('name', )

    prepopulated_fields = {"slug": ("name", )}
admin.site.register(models.Topic, TopicAdmin)


class CollectionAdmin(admin.ModelAdmin):
    """
    Admin interface for Collections
    """

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
    filter_horizontal = ('topics', 'exhibits', 'organizations')
    fields = ('name', 'slug', 'description', 'project', 'home_page',
              'thumbnail', 'enabled', 'topics', 'organizations', 'exhibits',
              'external_view', )
admin.site.register(models.Collection, CollectionAdmin)


class ProjectAdmin(admin.ModelAdmin):
    "Admin interface for projects"
    list_display = ('name', 'description', )
    prepopulated_fields = {"slug": ("name", )}
    search_fields = ('name',)

admin.site.register(models.Project, ProjectAdmin)


class OrganizationAdmin(admin.ModelAdmin):
    "Admin interface for Organizations"
    list_display = ('name', 'description', )

    prepopulated_fields = {"slug": ("name", )}
    search_fields = ('name',)
admin.site.register(models.Organization, OrganizationAdmin)
