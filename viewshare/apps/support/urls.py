from django.conf.urls import url, patterns
from django.views.generic import TemplateView
from viewshare.apps.support import views, forms

urlpatterns = patterns('',

    url(r'issue/augmentation/$',
        views.AugmentationIssueView.as_view(),
        name='create_augmentation_issue'),

    url(r'issue/create_error/$',
        TemplateView.as_view(template_name='support/issue_create_error.html'),
        name="create_issue_error"),

    url(r'issue/dataload-ignored-fields/(?P<source_id>[a-f0-9-]+)$',
        views.DataLoadIgnoredFieldsIssueView.as_view(form_class=forms.DataLoadIgnoredFieldsIssueForm),
        name='ignored_fields_issue'),

    url(r'issue/dataload-upload/(?P<source_id>[a-f0-9-]+)$',
        views.DataLoadUploadIssueView.as_view(form_class=forms.DataLoadUploadIssueForm),
        name='upload_issue'),

)
