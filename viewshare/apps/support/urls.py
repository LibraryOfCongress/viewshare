from django.conf.urls.defaults import url, patterns
from django.views.generic.simple import direct_to_template
from viewshare.apps.support import views


urlpatterns = patterns('',

    url(r'issue/augmentation/$',
        views.AugmentationIssueView(),
        name='create_augmentation_issue'),
    url(r'issue/create_error/$',
        direct_to_template, {'template': 'support/issue_create_error.html'}),

    url(r'issue/dataload-ignored-fields/(?P<tx_id>[a-f0-9-]+)$',
       views.ignored_fields_issue_view,
       name='ignored_fields_issue'),


    url(r'issue/dataload-upload/(?P<tx_id>[a-f0-9-]+)$',
       views.upload_issue_view,
       name='upload_issue'),

)
