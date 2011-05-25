from django.conf.urls.defaults import url, patterns

urlpatterns = patterns('recollection.apps.notices.views',

    url(r'^settings/$',
        'notification_settings',
        name='notification_settings'),

)
