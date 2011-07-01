from django.conf.urls.defaults import patterns, url
from django.contrib.auth.decorators import login_required
from django.views.generic.base import TemplateView
from recollection.upload import views


urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name="recollection/upload/upload.html"), name="upload_dataset"),
    url(r'^file/$', login_required(views.create_file_view), name="file_transform"),
    url(r'^url/$', login_required(views.create_url_view), name="url_transform"),
    url(r'^modsfile/$', login_required(views.create_mods_file_view), name="mods_file_transform"),
    url(r'^modsurl/$', login_required(views.create_mods_url_view), name="mods_url_transform"),
    url(r'^contentdm/', login_required(views.create_cdm_view), name="cdm_transform"),
)
