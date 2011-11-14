"""This module defines an abstract handler for exposing collection catalog
resources in exhibit format"""
from piston.handler import BaseHandler
from recollection.apps.collection_catalog.models import Collection, Project, Organization, Topic
from django.shortcuts import get_object_or_404
from freemix.utils import get_site_url

class AbstractCatalogHandler(BaseHandler):
    """
    A basic handler for collection catalog resources. This only supports 'GET'.
    
    For now, we want to limit the emitted types to 'JSON', as the XML and YAML
    emitters choke on the read method.
    """
    allowed_methods = ('GET',)
    fields = ("id", "slug", "label", "type", "description")

    @classmethod
    def type(cls, instance):
        "Exhibit differentiates records categories by the type field"
        return instance.__class__.__name__

    @classmethod
    def id(cls, instance):
        " For exhibit, we want the unique ID for a resource to be it's URL."
        return get_site_url(instance.get_absolute_url())

    @classmethod
    def label(cls, instance):
        "label is a required field for exhibit"
        return instance.name

    @classmethod
    def resource_uri(cls, instance):
        "The default resource_uri will be the instances absolute_URL"
        return ('%s_resource'%cls.type, [instance.slug])

    def get_all(self):
        "Returns all of the existing instances of this resource type."
        return self.model.objects.all()
        
    def read(self, request, slug=None):
        """Returns the results of get_all() if no slug is provided, wrapped in
        "items" for exhibit."""
        if slug:
            return get_object_or_404(self.model, slug=slug)
        else:
            return {"items": self.get_all()}

class CollectionHandler(AbstractCatalogHandler):
    """This handles all of the data elements in a collection.  Right now, they
    are munged into a form that exhibit can ingest projects and topics are 
    reduced to just the label.  views are reduced to the URL."""

    model = Collection
    fields = ("id", "slug", "label", "type", "project", "description",
            "topics", "exhibits", "home_page", "thumbnail","organizations", )


    @classmethod
    def project(cls, instance):
        "URL for the collection's project"
        return get_site_url(instance.project.get_absolute_url())

    @classmethod
    def topics(cls, instance):
        "URLs for all topic resources"
        return [get_site_url(t.get_absolute_url()) for t in instance.topics.iterator()]

    @classmethod
    def exhibits(cls, instance):
        "URLs for all collection views with the temporary external_view field."
        result = [get_site_url(exhibits.get_absolute_url()) for exhibits in
                instance.exhibits.iterator()]
        if instance.external_view:
            result.append(instance.external_view)
        return result

    @classmethod
    def thumbnail(cls, instance):
        "The collection thumbnail URL"
        if instance.thumbnail:
            return instance.thumbnail.url
        return None

    def get_all(self):
        "Returns all enabled collections"
        return self.model.objects.filter(enabled=True)


    @classmethod
    def organizations(cls, instance):
        "URLs for organization resources"
        return [get_site_url(o.get_absolute_url()) for o in instance.organizations.iterator()]

class ProjectHandler(AbstractCatalogHandler):
    "Handler for collection catalog projects"
    model = Project

class OrganizationHandler(AbstractCatalogHandler):
    "Handler for organizations"
    model = Organization
    fields = ("id", "slug", "label", "type", "description", "location",)

class TopicHandler(AbstractCatalogHandler):
    "Handler for collection catalog topics"
    model = Topic
