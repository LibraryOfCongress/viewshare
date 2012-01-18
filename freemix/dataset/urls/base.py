from django.conf.urls.defaults import url, patterns
from freemix.dataset import  views

# Dataset parameters
urlpatterns = patterns('',
    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.DataProfileJSONView.as_view(),
        name="dataset_profile_json"),
    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/data.json$",
        views.DataJSONView.as_view(),
        name="dataset_data_json"),
    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/properties.json$",
        views.DataPropertiesCacheJSONView.as_view(),
        name="dataset_properties_cache_json"),
)

