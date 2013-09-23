from django.conf import settings

DEFAULT_EXHIBIT_CANVAS = getattr(settings,
                                 "DEFAULT_EXHIBIT_CANVAS",
                                 "three-column")

SIMILE_PAINTER_SERVICE_URL = getattr(settings,
                                     "SIMILE_PAINTER_SERVICE_URL",
                                     "http://service.simile.zepheira.com"
                                     "/painter/painter")
