from django.conf.urls.defaults import url, patterns
from freemix.exhibit import views

urlpatterns = patterns('',
    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.ExhibitProfileJSONView.as_view(),
        name="exhibit_profile_json"),

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/$",
        views.ExhibitDisplayView.as_view(),
        name="exhibit_display"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/detail/$',
       views.ExhibitDetailView.as_view(),
       name='exhibit_detail'),

)

