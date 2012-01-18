from freemix.dataset import views
from django.conf.urls.defaults import url, patterns

urlpatterns = patterns('',
    url(r'^(?P<tx_id>[a-f0-9-]+)/$', views.ProcessTransactionView.as_view(), name='datasource_transaction'),
    url(r'^(?P<tx_id>[a-f0-9-]+)/result.json$', views.DataSourceTransactionResultView.as_view(), name='datasource_transaction_result'),
    url(r'^(?P<tx_id>[a-f0-9-]+)/publish$', views.DataSourceTransactionResultView.as_view(), name='dataset_publish'),
)
