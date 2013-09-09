from django.conf.urls import url, patterns
from django.contrib.auth.decorators import login_required
from freemix.exhibit import views

urlpatterns = patterns('',
    #display

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.PublishedExhibitProfileJSONView.as_view(),
        name="exhibit_profile_json"),

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/$",
        views.PublishedExhibitDisplayView.as_view(),
        name="exhibit_display"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/properties/$',
        views.PublishedExhibitPropertiesListView.as_view(),
        name='exhibit_property_list'),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/properties/(?P<property>[a-zA-Z0-9_.-]+)/data/$',
        views.PublishedExhibitPropertyDataView.as_view(),
        name='exhibit_property_data'),

    # details
    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/detail/edit/$',
        login_required(views.ExhibitDetailEditView.as_view()),
        name="exhibit_edit_form"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/detail/$',
       views.PublishedExhibitDetailView.as_view(),
       name='exhibit_detail'),

    # list

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/$',
      views.PublishedExhibitListView.as_view(),
      name='exhibit_list_by_owner'),

    #embed

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/embed.js$',
      views.embedded_exhibit_view,
      name='exhibit_embed_js'),

    #draft

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/$',
       login_required(views.DraftExhibitUpdateView.as_view()),
       name='exhibit_edit'),

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/profile.json$",
        views.DraftExhibitProfileJSONView.as_view(),
        name="draft_exhibit_profile_json"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/publish/$',
        login_required(views.PublishExhibitView.as_view()),
        name='exhibit_publish'),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/properties/$',
        login_required(views.DraftExhibitPropertiesListView.as_view()),
        name='draft_exhibit_property_list'),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/properties/(?P<property>[a-zA-Z0-9_.-]+)/$',
        login_required(views.DraftExhibitPropertiesJSONView.as_view()),
        name='draft_exhibit_property_json'),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/properties/(?P<property>[a-zA-Z0-9_.-]+)/data/$',
        login_required(views.DraftExhibitPropertyDataView.as_view()),
        name='draft_exhibit_property_data'),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/draft/properties/(?P<property>[a-zA-Z0-9_.-]+)/data/status/$',
        login_required(views.DraftExhibitPropertyDataStatusView.as_view()),
        name='draft_exhibit_property_status'),


)

