from django import template
from freemix.utils import get_site_url

register = template.Library()

def _nicename(u):
    return u.username

"Outputs a string representing the user"
@register.filter
def nicename(u):
    return _nicename(u)
nicename.is_safe = True


"Outputs the fully qualified URL for a provided path"
@register.simple_tag
def site_url(path="/"):
    return str(get_site_url(path))
