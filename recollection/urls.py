from django.conf.urls.defaults import *
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.generic.base import RedirectView
from django.contrib import admin

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from recollection import feeds
from recollection.utils.views import UserHomeView

admin.autodiscover()

# override context-less 500
handler500 = 'recollection.utils.views.server_error'

feed_dict = {
    'latest_views': feeds.LatestDataViews,
    'latest_views_atom': feeds.AtomLatestDataViews,
    'views': feeds.UserDataViews,
    'views_atom': feeds.AtomUserDataViews,

    'latest_data': feeds.LatestDatasets,
    'latest_data_atom': feeds.AtomLatestDatasets,
    'data': feeds.UserDatasets,
    'data_atom': feeds.AtomUserDatasets,
}

urlpatterns = patterns('',

    (r'^account/', include('pinax.apps.account.urls')),
    (r'^profiles/', include('recollection.apps.profiles.urls')),

    (r'^invitations/', include('recollection.apps.connections.urls')),
    (r'^notices/', include('recollection.apps.notices.urls')),
    (r'^notices/', include('notification.urls')),
    (r'^announcements/', include('announcements.urls')),
    (r'^robots.txt$', include('robots.urls')),
    (r'^admin/', include(admin.site.urls)),

    (r'^feeds/(.*)/$', 'django.contrib.syndication.views.feed', {"feed_dict": feed_dict}),

    (r'^catalog/', include('recollection.apps.collection_catalog.urls')),
    (r'^support/', include('recollection.apps.support.urls')),

    url(r'^profiles/profile/(?P<username>[\w\._-]+)/connections/$',
        'recollection.apps.connections.views.connection_list_by_user',
        name='connection_list_by_user') ,

    # Lists of connections datasets and views
    url(r'data/(?P<username>[a-zA-Z0-9_.-]+)/connections/$',
        'recollection.apps.connections.views.datasets_by_user_connections',
        name='datasets_by_user_connections'),

    url(r'views/(?P<username>[a-zA-Z0-9_.-]+)/connections/$',
        'recollection.apps.connections.views.exhibit_list_by_user_connections',
        name='exhibit_list_by_user_connections'),

    (r'^upload/', include('recollection.upload.urls')),
    (r'^data/', include('freemix.dataset.urls')),

    (r'^views/', include('freemix.exhibit.urls')),
    (r'^augment/', include('freemix.augment.urls')),
    (r'^share/', include('recollection.share.urls')),
    url(r'mix/', 'recollection.mixer.mix_data', name='mixer_receiving_endpoint'),

    url(r'^userhome/$', login_required(UserHomeView.as_view()), name="user_home"),

    # For legacy purposes
    url(r'^userupload/$', login_required(RedirectView.as_view(url="/upload")), name="user_upload"),

    # CMS url definition should come after all others
    (r'^', include('cms.urls')),

) + staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )

