from django.conf.urls.defaults import url, patterns
from django.contrib.auth.decorators import login_required
from viewshare.apps.legacy.dataset import  views

# Dataset List URLs
urlpatterns = patterns('',
    url(r"^datasets/(?P<owner>[a-zA-Z0-9_.-]+)/$",
        views.dataset_list_by_owner,
        name="dataset_list_by_owner"
    ),
    # url(r"^transactions/(?P<owner>[a-zA-Z0-9_.-]+)/$",
    #     views.datasource_transaction_list_by_owner,
    #     name="datasource_transaction_list_by_owner"
    # ),
    url(r"^pending/$",
        login_required(views.datasource_list_pending),
        name="datasource_list_pending")
)
