from django.conf import settings
from django.conf.urls.defaults import patterns, include

urlpatterns = patterns('',

    (r'^', include('freemix.dataset.urls.list')),
    (r'^source/', include('freemix.dataset.urls.datasource')),
    (r'^', include('freemix.dataset.urls.base')),
    (r'^', include('freemix.dataset.urls.viewer')),
    (r'^', include('freemix.dataset.urls.editor')),

)

if "freemix.exhibit" in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
        (r'^', include('freemix.exhibit.urls.dataset')),
    )
