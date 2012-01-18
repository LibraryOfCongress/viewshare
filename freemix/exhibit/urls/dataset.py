# URL patterns for linking exhibits to their dataset

from django.conf.urls.defaults import url
from django.contrib.auth.decorators import login_required
from freemix.exhibit import views

urlpatterns = (
    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/views.html$',
        views.ExhibitsByDatasetListView.as_view(),
        name='exhibits_by_dataset'
    ),
    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/view/profile.json$',
        views.StockExhibitProfileJSONView.as_view(),
        name='exhibit_profile_template'
    ),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/view/canvases.html',
        views.CanvasListView.as_view(),
        name='exhibit_canvas_chooser'
    ),    

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/view/create/(?P<canvas>[a-zA-Z0-9_.-]+)/$',
        login_required(views.ExhibitCreateFormView.as_view()),
        name="exhibit_create_form"),

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/view/$',
        login_required(views.ExhibitCreateView.as_view()),
        name='exhibit_create_editor'
    ),
)