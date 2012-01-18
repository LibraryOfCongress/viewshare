from django.conf.urls.defaults import url, patterns

from freemix.exhibit import views

urlpatterns = patterns('',

    url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/$',
      views.ExhibitListView.as_view(),
      name='exhibit_list_by_owner'),

)