from django.conf.urls.defaults import url, patterns
from django.contrib.auth.decorators import login_required

# Dataset editor
from freemix.dataset import views

urlpatterns = patterns('',

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)$',
       login_required(views.DataSourceDetailView.as_view()),
       name="datasource_detail"),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/edit',
        login_required(views.UpdateDataSourceView.as_view()),
        name="datasource_update"),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/refresh',
        login_required(views.RefreshDataSourceView.as_view()),
        name="datasource_refresh"),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/latest.json',
        login_required(views.DataSourceTransactionResultView.as_view()),
        name="datasource_transaction_result"
        ),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/latest',
        login_required(views.DataSourceTransactionView.as_view()),
        name="datasource_transaction"),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/latest_status.json',
        views.DataSourceTransactionStatusView.as_view(),
        name="datasource_transaction_status"),

    url(r'^(?P<uuid>[a-zA-Z0-9_.-]+)/file$',
        login_required(views.FileDataSourceDownloadView.as_view()),
        name="file_datasource_file_url"),

    url(r'^(?P<uuid>[a-f0-9-]+)/create/$',
        login_required(views.DatasetCreateFormView.as_view()),
        name="dataset_create_form"),
    # url(r'^tx/(?P<tx_id>[a-f0-9-]+)/$', views.ProcessTransactionView.as_view(), name='datasource_transaction'),
    # url(r'^tx/(?P<tx_id>[a-f0-9-]+)/result.json$', views.DataSourceTransactionResultView.as_view(), name='datasource_transaction_result'),
    # url(r'^tx/(?P<tx_id>[a-f0-9-]+)/status.json$', views.DataSourceTransactionStatusView.as_view(), name='datasource_transaction_status'),
)
