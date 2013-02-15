from django.conf.urls.defaults import url, patterns
from django.contrib.auth.decorators import login_required

# Dataset editor
from freemix.dataset.views import UpdateDataSourceView, FileDataSourceDownloadView

urlpatterns = patterns('',

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)$',
       login_required(UpdateDataSourceView.as_view()),
       name="datasource_detail"),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/refresh$',
        login_required(UpdateDataSourceView.as_view()),
        name="datasource_update"),


    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/file$',
        login_required(FileDataSourceDownloadView.as_view()),
        name="file_datasource_file_url"),
)
