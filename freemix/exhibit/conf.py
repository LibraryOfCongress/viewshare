from django.conf import settings

DEFAULT_EXHIBIT_CANVAS = getattr(settings, "DEFAULT_EXHIBIT_CANVAS", "three-column")
DEFAULT_EXHIBIT_THEME = getattr(settings, "DEFAULT_EXHIBIT_THEME", "smoothness")