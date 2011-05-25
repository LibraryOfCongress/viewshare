from django.conf.urls.defaults import url, patterns
from django.views.generic.simple import direct_to_template
from . import views


urlpatterns = patterns('',

    url(r'issue/augmentation/$',
        views.AugmentationIssueView(),
        name='create_augmentation_issue'),
    url(r'issue/create_error/$',
        direct_to_template, {'template': 'support/issue_create_error.html'}),

    url(r'issue/dataload-url-ignored-fields/$',
       views.url_ignored_fields_issue_view,
       name='url_ignored_fields_issue'),
    url(r'issue/dataload-file-ignored-fields/$',
       views.file_ignored_fields_issue_view,
       name='file_ignored_fields_issue'),


    url(r'issue/dataload-url-upload/$',
       views.url_upload_issue_view,
       name='url_upload_issue'),
    url(r'issue/dataload-file-upload/$',
       views.file_upload_issue_view,
       name='file_upload_issue'),

)
