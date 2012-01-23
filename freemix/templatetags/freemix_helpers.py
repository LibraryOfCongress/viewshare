from django import template
from django.core.cache import cache
from freemix.permissions import PermissionsRegistry
from freemix.utils import get_site_url
from freemix import __version__

register = template.Library()

def _nicename(u):
    result = cache.get("nicename%s"%u.id)
    if result is None:

        if u.get_profile().name:
            result = u.get_profile().name
        else:
            result = u.username
        cache.set("nicename%s"%u.id, result)
    return result

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