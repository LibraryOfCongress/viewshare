from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template

urlpatterns = patterns('',
    url(r'^community/$', direct_to_template, {"template": "about/community.html"}, name="community"),
    url(r'^help/$', direct_to_template, {"template": "about/help.html"}, name="help"),
    url(r'^userguide/$', direct_to_template, {"template": "about/userguide.html"}, name="userguide"),
    url(r'^faq/$', direct_to_template, {"template": "about/faq.html"}, name="faq"),
    url(r'^featured_views/$', direct_to_template, {"template": "about/featured_views.html"}, name="about_featured_views"),
    url(r'^welcome/$', direct_to_template, {"template": "about/welcome.html"}, name="about_welcome"),
)


