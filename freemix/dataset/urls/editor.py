from django.conf.urls.defaults import url, patterns
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView

# Dataset editor
from freemix.dataset import views

urlpatterns = patterns('',
    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/editor/$',
        login_required(views.DatasetProfileEditView.as_view()),
        name="dataset_edit"),

    url(r'^tx/(?P<tx_id>[a-f0-9-]+)/create/$',
        login_required(views.DatasetCreateFormView.as_view()),
        name="dataset_create_form"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/detail/edit/$',
        login_required(views.DatasetDetailEditView.as_view()),
        name="dataset_edit_form"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/editor/create_success/$',
        TemplateView.as_view(template_name="dataset/create/success.html"),
        name="dataset_create_success"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/source/$',
        login_required(views.RedirectUpdateDataSourceView.as_view()),
        name="dataset_source_update"),
)
