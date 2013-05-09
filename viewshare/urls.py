from django.conf.urls.defaults import *
from django.conf import settings
from django.contrib.auth.decorators import login_required

from django.contrib import admin

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic import RedirectView

from viewshare.utilities.views import UserHomeView
from viewshare.utilities import feeds


admin.autodiscover()

# override context-less 500
handler500 = 'viewshare.utilities.views.server_error'

urlpatterns = patterns('',

    (r'^account/', include('viewshare.apps.account.urls')),
    (r'^registration/', include('viewshare.apps.moderated_registration.urls')),

    (r'^profiles/', include('viewshare.apps.profiles.urls')),

    (r'^invitations/', include('viewshare.apps.connections.urls')),
    (r'^notices/', include('viewshare.apps.vendor.notification.urls')),
    (r'^announcements/', include('viewshare.apps.vendor.announcements.urls')),
    (r'^admin/', include(admin.site.urls)),

    (r'^catalog/', include('viewshare.apps.collection_catalog.urls')),
    (r'^support/', include('viewshare.apps.support.urls')),

    url(r'^profiles/profile/(?P<username>[\w\._-]+)/connections/$',
        'viewshare.apps.connections.views.connection_list_by_user',
        name='connection_list_by_user') ,

    # Lists of connections datasets and views
    url(r'data/(?P<username>[a-zA-Z0-9_.-]+)/connections/$',
        'viewshare.apps.connections.views.datasets_by_user_connections',
        name='datasets_by_user_connections'),

    url(r'views/(?P<username>[a-zA-Z0-9_.-]+)/connections/$',
        'viewshare.apps.connections.views.exhibit_list_by_user_connections',
        name='exhibit_list_by_user_connections'),

    (r'^upload/', include('viewshare.apps.upload.urls')),
    (r'^data/', include('freemix.dataset.urls')),
    # (r'^source/', include('freemix.dataset.urls.datasource')),

    (r'^views/', include('freemix.exhibit.urls')),
    (r'^augment/', include('freemix.dataset.augment.urls')),
    (r'^share/', include('freemix.exhibit.share.urls')),

    url(r'^userhome/$', login_required(UserHomeView.as_view()), name="user_home"),

    (r'^feeds/latest_views/$', feeds.LatestDataViews()),
    (r'^feeds/latest_views_atom/$', feeds.AtomLatestDataViews()),
    (r'^feeds/views/(?P<owner>[a-zA-Z0-9_.-]+)/$', feeds.UserDataViews()),
    (r'^feeds/views_atom/(?P<owner>[a-zA-Z0-9_.-]+)/$', feeds.AtomUserDataViews()),
    (r'^feeds/latest_data/$', feeds.LatestDatasets()),
    (r'^feeds/latest_data_atom/$', feeds.AtomLatestDatasets()),
    (r'^feeds/data/(?P<owner>[a-zA-Z0-9_.-]+)/$', feeds.UserDatasets()),
    (r'^feeds/data_atom/(?P<owner>[a-zA-Z0-9_.-]+)/$', feeds.AtomUserDatasets()),

    # home page
    url(r'^$', 'viewshare.apps.discover.views.front_page', name="front_page"),

)

urlpatterns += staticfiles_urlpatterns()

try:
    import local_urls
    urlpatterns += local_urls.urlpatterns
except ImportError:
    pass

urlpatterns += patterns('',

    # Help pages that are linked from templates
    url(r'^about/tos$',
        RedirectView.as_view(url="http://viewshare.uservoice.com"),
        name="tos"),

    url(r'^about/community/$',
        RedirectView.as_view(url="http://viewshare.uservoice.com"),
        name="community"),

    url(r'^about/help/$',
        RedirectView.as_view(url="http://viewshare.uservoice.com"),
        name="help"),

    url(r'^about/faq/$',
        RedirectView.as_view(url="http://viewshare.uservoice.com"),
        name="faq"),

    url(r'^about/userguide/$',
        RedirectView.as_view(url="http://viewshare.uservoice.com"),
        name="userguide"),

    url(r'^augment/patterns/$',
        RedirectView.as_view(url="http://viewshare.uservoice.com"),
        name="augment-list-patterns"),

)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )

