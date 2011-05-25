from django.conf.urls.defaults import *

urlpatterns = patterns('recollection.apps.connections.views',
    url(r'^$', 'connections', name='invitations'),
)
