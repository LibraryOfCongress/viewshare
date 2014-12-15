from django.conf.urls import *

urlpatterns = patterns('viewshare.apps.connections.views',
    url(r'^$', 'connections', name='invitations'),
)
