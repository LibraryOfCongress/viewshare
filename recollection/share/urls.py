from django.conf.urls.defaults import patterns, url
from django.views.generic.base import TemplateView
from recollection.share import views


urlpatterns = patterns('',
    url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/$",
        views.SharedExhibitDisplayView.as_view(),
        name="shared_exhibit_display"),
    url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/data.json$",
        views.SharedDatasetDataJSONView.as_view(),
        name="shared_dataset_data_json"),
    url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/data_profile.json$",
        views.SharedDatasetProfileJSONView.as_view(),
        name="shared_dataset_profile_json"),
    url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.SharedExhibitProfileJSONView.as_view(),
        name="shared_exhibit_profile_json"),

)
