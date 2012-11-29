from django.conf.urls.defaults import *
from django.conf import settings
urlpatterns = patterns('',
    #url(r'^username_autocomplete/$', 'autocomplete_app.views.username_autocomplete_friends', name='profile_username_autocomplete'),
    url(r'^$', 'viewshare.apps.profiles.views.profiles', name='profile_list'),
    url(r'^profile/(?P<username>[\w\._-]+)/$', 'viewshare.apps.profiles.views.profile', name='profile_detail'),
    url(r'^edit/$', 'viewshare.apps.profiles.views.profile_edit', name='profile_edit'),
)
