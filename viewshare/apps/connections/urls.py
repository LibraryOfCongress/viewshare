from django.conf.urls.defaults import *

urlpatterns = patterns('viewshare.apps.connections.views',
    url(r'^$', 'connections', name='invitations'),
)
