from django import template
from recollection import __version__
from recollection.utils.views import get_akara_version
from freemix.dataset.transform import AKARA_URL_PREFIX

register = template.Library()

@register.simple_tag
def recollection_version():
    """Outputs the current Recollection version"""
    return __version__

@register.simple_tag
def akara_version():
    return get_akara_version()

@register.simple_tag
def akara_prefix_url():
    return AKARA_URL_PREFIX