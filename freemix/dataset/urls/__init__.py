from django.conf import settings
from django.conf.urls.defaults import patterns, include

urlpatterns = patterns('',

    (r'tx/', include('freemix.dataset.urls.transaction')),
    (r'^', include('freemix.dataset.urls.base')),
    (r'^', include('freemix.dataset.urls.viewer')),
    (r'^', include('freemix.dataset.urls.editor')),
    (r'^', include('freemix.dataset.urls.list')),

)

if "freemix.exhibit" in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
        (r'^', include('freemix.exhibit.urls.dataset')),
    )