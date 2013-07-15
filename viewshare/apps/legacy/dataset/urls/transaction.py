from django.conf.urls.defaults import url, patterns

from viewshare.apps.legacy.dataset import views


urlpatterns = patterns('',
    url(r'^tx/(?P<tx_id>[a-f0-9-]+)/$', views.ProcessTransactionView.as_view(), name='datasource_transaction'),
    url(r'^tx/(?P<tx_id>[a-f0-9-]+)/result.json$', views.DataSourceTransactionResultView.as_view(), name='datasource_transaction_result'),
    url(r'^tx/(?P<tx_id>[a-f0-9-]+)/status.json$', views.DataSourceTransactionStatusView.as_view(), name='datasource_transaction_status'),
    url(r'^tx/(?P<tx_id>[a-f0-9-]+)/publish$', views.DataSourceTransactionResultView.as_view(), name='dataset_publish'),
)
