from django.conf.urls.defaults import url, patterns
from django.contrib.auth.decorators import login_required

# Dataset editor
from freemix.dataset.views import UpdateDataSourceView, FileDataSourceDownloadView

urlpatterns = patterns('',

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/$',
        login_required(UpdateDataSourceView.as_view()),
        name="datasource_update"),


    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/(?P<filename>[a-zA-Z0-9_.-]+)$',
        login_required(FileDataSourceDownloadView.as_view()),
        name="file_datasource_file_url"),
)
