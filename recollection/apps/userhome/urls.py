from django.conf.urls.defaults import *

urlpatterns = patterns('recollection.apps.userhome.views',
               url(r'^$', 'user_home', name='user_home'),
)
