from django.conf.urls import patterns, url
from viewshare.apps.augment import views

urlpatterns = patterns('',
                       url(r'^patterns.json$',
                           views.pattern_json,
                           name="list_pattern_json"),
                       url(r'^errors.json$',
                           views.error_json,
                           name="augmentation_error_json"),
                       )
