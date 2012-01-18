from django.conf.urls.defaults import url, patterns

from freemix.exhibit import views

urlpatterns = patterns('',

       url(r'^(?P<owner>[a-zA-Z0-9_.-]+)/(?P<slug>[a-zA-Z0-9_.-]+)/embed.js$',
          views.EmbeddedExhibitView.as_view(),
          name='exhibit_embed_js'),


)