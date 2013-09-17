from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView
from viewshare.apps.upload import views


urlpatterns = patterns('',
    url(r'^$',
        TemplateView.as_view(template_name="upload/upload.html"),
        name="upload_dataset"),

    url(r'^file/$',
        login_required(views.create_file_view),
        name="file_transform"),

    url(r'^url/$',
        login_required(views.create_url_view),
        name="url_transform"),

    url(r'^modsfile/$',
        login_required(views.create_mods_file_view),
        name="mods_file_transform"),

    url(r'^modsurl/$',
        login_required(views.create_mods_url_view),
        name="mods_url_transform"),

    url(r'^contentdm/',
        login_required(views.create_cdm_view),
        name="cdm_transform"),

    url(r'^oai/',
        login_required(views.create_oai_view),
        name="oai_transform"),

    url(r'^oailist.json',
        views.OAISetListView.as_view(),
        name="oai_set_list"),

    url(r'^jsonurl/',
        login_required(views.create_json_url_view),
        name="json_url_transform"),

    url(r'^jsonfile/',
        login_required(views.create_json_file_view),
        name="json_file_transform"),

    url(r'^json.prep',
        views.JSONPrepView.as_view(),
        name="json_prep_view"),

    url(r'^source/(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/file/$',
        login_required(views.FileDataSourceDownloadView.as_view()),
        name="file_datasource_file_url"),

    url(r'^source/(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/status/$',
        login_required(views.UploadTransactionView.as_view()),
        name="upload_transaction_status"),

    url(r'^source/(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/status/ping/$',
        login_required(views.UploadTransactionStatusJSONView.as_view()),
        name="upload_transaction_status_json"),

    url(r'^source/(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/$',
        login_required(views.UpdateDataSourceView.as_view()),
        name="update_datasource"),

)
