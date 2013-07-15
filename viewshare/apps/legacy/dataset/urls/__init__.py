from django.conf import settings
from django.conf.urls.defaults import patterns, include

urlpatterns = patterns('',

    (r'^', include('viewshare.apps.legacy.dataset.urls.list')),
    (r'^source/', include('viewshare.apps.legacy.dataset.urls.datasource')),
    (r'^', include('viewshare.apps.legacy.dataset.urls.base')),
    (r'^', include('viewshare.apps.legacy.dataset.urls.viewer')),
    (r'^', include('viewshare.apps.legacy.dataset.urls.editor')),

)

if "freemix.exhibit" in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
        (r'^', include('freemix.exhibit.urls.dataset')),
    )
