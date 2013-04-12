"""URLs for Collections, Organizations, Projects and Topics
Currently, this just consists of what is necessary for exhibit.
"""

from django.conf.urls import url, patterns
from django.views.generic import TemplateView
from viewshare.apps.collection_catalog import views, models


def generate_url_pattern(model):
    "Generate list and instance JSON URLs for a particular resource"
    model_name = model.__name__.lower()
    return (
        url(r'^%ss/(?P<slug>[^/]+)/$' % model_name,
            views.CatalogItemJSONView.as_view(model=model),
            name='%s_resource' % model_name),

        url(r'^%ss/?$' % model_name,
            views.CatalogListJSONView.as_view(model=model),
            name='%ss' % model_name),
    )


urlpatterns = patterns('',
    url(r'^$',
       TemplateView.as_view(template_name="catalog/index.html"),
       name="catalog"),
)
urlpatterns += generate_url_pattern(models.Collection)
urlpatterns += generate_url_pattern(models.Organization)
urlpatterns += generate_url_pattern(models.Project)
urlpatterns += generate_url_pattern(models.Topic)
