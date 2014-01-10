from django.conf import settings

SIMILE_PAINTER_SERVICE_URL = getattr(settings,
                                     "SIMILE_PAINTER_SERVICE_URL",
                                     "http://service.simile.zepheira.com"
                                     "/painter/painter")
