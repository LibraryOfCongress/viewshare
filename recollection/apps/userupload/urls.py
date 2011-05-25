from django.conf.urls.defaults import *

urlpatterns = patterns('recollection.apps.userupload.views',
               url(r'^$', 'user_upload', name='user_upload'),
)
