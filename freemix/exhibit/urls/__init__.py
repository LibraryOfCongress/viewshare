from django.conf.urls.defaults import *
from django.contrib.auth.decorators import login_required
from freemix.exhibit import views
urlpatterns = patterns('',


    (r'^', include('freemix.exhibit.urls.display')),

    (r'^', include('freemix.exhibit.urls.list')),
    (r'^', include('freemix.exhibit.urls.embed')),
    (r'^', include('freemix.exhibit.urls.editor')),

)
