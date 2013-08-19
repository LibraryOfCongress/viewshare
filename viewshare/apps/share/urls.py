from django.conf.urls.defaults import patterns, url
from django.views.generic.base import TemplateView
from viewshare.apps.share import views


urlpatterns = patterns('',
    url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/$",
        views.SharedExhibitDisplayView.as_view(),
        name="shared_exhibit_display"),

    #url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/data.json$",
    #    views.shared_dataset_data_json,
    #    name="shared_dataset_data_json"),
    #url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/data_profile.json$",
    #    views.shared_dataset_profile_json,
    #    name="shared_dataset_profile_json"),
    #
    #url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/properties.json$",
    #    views.shared_dataset_properties_json,
    #    name="shared_dataset_properties_cache_json"),

    url(r"^(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.shared_exhibit_profile_view,
        name="shared_exhibit_profile_json"),

    url(r"^view/(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/$",
        views.SharedKeyCreateFormView.as_view(),
        name="shared_key_create_form"),

    url(r"(?P<slug>[a-zA-Z0-9_.-]+)/create_success/$",
        TemplateView.as_view(template_name="share/create_success.html"),
        name="shared_key_create_success")
)
