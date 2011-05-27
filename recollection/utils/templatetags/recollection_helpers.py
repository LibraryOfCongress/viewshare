from django import template
from recollection import __version__

register = template.Library()

"Outputs the current Recollection version"
@register.simple_tag
def recollection_version():
    return __version__

