from django.conf.urls.defaults import url, patterns
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView

# Dataset editor
from freemix.exhibit import views

urlpatterns = patterns('',
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
