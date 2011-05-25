"""URLs for Collections, Organizations, Projects and Topics                   
Currently, this just consists of what is necessary for exhibit.
"""
from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template
from piston.resource import Resource
from recollection.apps.collection_catalog.handlers import ProjectHandler
from recollection.apps.collection_catalog.handlers import OrganizationHandler
from recollection.apps.collection_catalog.handlers import CollectionHandler
from recollection.apps.collection_catalog.handlers import TopicHandler


def generate_url_pattern(resource):
    "Generate some standard REST URLs for a particular resource"
    model_name = resource.handler.model.__name__.lower()
    return (
        url(r'^%ss/(?P<slug>[^/]+)/$'%model_name,
            resource,
            {'emitter_format': 'json'},
            name='%s_resource'%model_name),

        url(r'^%ss/?$'%model_name,
            resource, {'emitter_format': 'json'},
            name='%ss'%model_name),
    )

urlpatterns = patterns('',
               url(r'^$', direct_to_template, {"template": "catalog/index.html"}, name="catalog"),
               )
urlpatterns += generate_url_pattern(Resource(CollectionHandler))
urlpatterns += generate_url_pattern(Resource(OrganizationHandler))
urlpatterns += generate_url_pattern(Resource(ProjectHandler))
urlpatterns += generate_url_pattern(Resource(TopicHandler))
