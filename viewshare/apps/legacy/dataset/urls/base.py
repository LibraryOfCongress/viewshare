from django.conf.urls.defaults import url, patterns
from viewshare.apps.legacy.dataset import  views

# Dataset parameters
urlpatterns = patterns('',
    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.dataset_profile_json,
        name="dataset_profile_json"),

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/data.json$",
        views.dataset_data_json,
        name="dataset_data_json"),

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/properties.json$",
        views.dataset_properties_json,
        name="dataset_properties_cache_json"),
)

