from django import template
from django.conf import settings
from django.core.cache import cache
from django.template import Variable

from viewshare.apps.site_theme.models import SiteTheme, Skin


register = template.Library()

@register.simple_tag
def site_skin():
    """Return the URL (not including the path to static files) to the site's current skin"""

    skin_url = cache.get("site_skin_%s"%settings.SITE_ID)

    if skin_url is None:

        try:
            skin = Skin.objects.get(site__id__exact=settings.SITE_ID)
            skin_url = skin.theme.url
        except Skin.DoesNotExist:
            # This should be an impossible condition to reach, but just in case
            theme = SiteTheme.objects.get(id__exact=1)
            skin_url = theme.url
        cache.set("site_skin_%s"%settings.SITE_ID, skin_url, 3600*24)
    return skin_url

@register.tag
def site_theme_css_link(parser, token):
    """Useful to show a preview, not for usage in normal templates"""
    try:
        tag_name, slug = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError, "%r tag requires a single argument" % token.contents[0]
    return SiteThemeLinkNode(slug)

class SiteThemeLinkNode( template.Node ):
    def __init__(self, slug):
        self.slug = slug

    def render(self, context):
        slug = Variable(self.slug).resolve(context)
        theme = SiteTheme.objects.get(slug=slug)
        return theme.url
