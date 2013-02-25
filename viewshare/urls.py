from django.conf.urls.defaults import *
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.generic.base import RedirectView
from django.views.generic.base import TemplateView
from django.contrib import admin

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from viewshare.utilities.views import UserHomeView, PlainTextResponse
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

    # URL mappings for fixed cms pages
    url(r'^tos/$', 'cms.views.details', kwargs={"slug": "tos"}, name="tos"),
    url(r'^about/community/$', 'cms.views.details', kwargs={"slug": "community"}, name="community"),
    url(r'^about/help/$', 'cms.views.details', kwargs={"slug": "help"}, name="help"),
    url(r'^about/faq/$', 'cms.views.details', kwargs={"slug": "faq"}, name="faq"),
    url(r'^about/userguide/$', 'cms.views.details', kwargs={"slug": "userguide"}, name="userguide"),
    url(r'^augment/patterns/$', 'cms.views.details', kwargs={"slug": "augment-list-patterns"}, name="augment-list-patterns"),

    # home page
    url(r'^$', 'viewshare.apps.discover.views.front_page', name="front_page"),

    # For legacy purposes
    url(r'^userupload/$', login_required(RedirectView.as_view(url="/upload")),
                                                              name="user_upload"),

    # Override the robots.txt template to
    (r'^robots.txt$', TemplateView.as_view(template_name="robots.txt",
                                           response_class=PlainTextResponse)),

) + staticfiles_urlpatterns()

if getattr(settings, "USERVOICE_SETTINGS", None):
    urlpatterns += patterns('',
        (r'^uservoice/', include('viewshare.apps.uservoice.urls')),
    )

urlpatterns += patterns('',

    # CMS url definition should come after all others
    (r'^', include('cms.urls')),
)


if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )

