from django import template
from freemix.utils import get_site_url


register = template.Library()


def _nicename(u):
    return u.username


@register.filter
def nicename(u):
    """
    Outputs a string representing the user
    """
    return _nicename(u)

nicename.is_safe = True


@register.simple_tag
def site_url(path="/"):
    """
    Outputs the fully qualified URL for a provided path
    """
    return str(get_site_url(path))
