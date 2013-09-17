from django import template
from freemix.utils import get_site_url


register = template.Library()

@register.simple_tag
def site_url(path="/"):
    """
    Outputs the fully qualified URL for a provided path
    """
    return str(get_site_url(path))
