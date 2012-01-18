from django import template
from freemix.permissions import PermissionsRegistry
from freemix.utils import get_site_url
from freemix import __version__

register = template.Library()

def _nicename(u):
    if u.get_profile().name:
        return u.get_profile().name
    else:
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


"Outputs the current Freemix version"
@register.simple_tag
def freemix_version():
    return __version__


@register.filter
def permission_filter(queryset, permission, user):
    return queryset.filter(PermissionsRegistry.get_filter(permission, user))