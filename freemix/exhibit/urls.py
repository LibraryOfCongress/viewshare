from django.conf.urls import url, patterns
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from freemix.exhibit import views

urlpatterns = patterns('',
    #display

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/profile.json$",
        views.ExhibitProfileJSONView.as_view(),
        name="exhibit_profile_json"),

    url(r"^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/$",
        views.ExhibitDisplayView.as_view(),
        name="exhibit_display"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/detail/$',
       views.ExhibitDetailView.as_view(),
       name='exhibit_detail'),

    # list

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/$',
      views.ExhibitListView.as_view(),
      name='exhibit_list_by_owner'),

    #embed

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/embed.js$',
      views.embedded_exhibit_view,
      name='exhibit_embed_js'),

    #editor

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/editor/$',
       login_required(views.ExhibitProfileUpdateView.as_view()),
       name='exhibit_edit'),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/detail/edit/$',
        login_required(views.ExhibitDetailEditView.as_view()),
        name="exhibit_edit_form"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/editor/create_success/$',
        TemplateView.as_view(template_name="exhibit/create/success.html"),
        name="exhibit_create_success"),
)

