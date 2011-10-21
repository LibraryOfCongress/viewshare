from django.db import models
from django.utils.translation import get_language_from_request, ugettext_lazy as _
from django.template.loader import render_to_string
from django.contrib.sites.models import Site

# Platforms built on Freemix should put their own media/site_theme/css/default/ theme
# in the way of the Freemix one to override the default theme distributed with Freemix.

class SiteTheme(models.Model):
    slug = models.SlugField(_('slug'),max_length=100,unique=True)
    name = models.CharField(_('name'), max_length=30, null=False, blank=False, default="Label")
    description = models.CharField(_('description'),max_length=200,null=True, blank=True,
            help_text=_("Describe the colors and aesthetics in use in the theme"))
    url = models.CharField(_('url'), max_length=200, null=False, blank=False,
            help_text=_("Example: '/static/site_theme/css/default/base.css'"),
            default="/static/site_theme/css/default/base.css")

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = "Site Theme"
        verbose_name_plural = "Site Themes"

class Skin(models.Model):
    site = models.ForeignKey(Site, unique=True, blank=False, null=False)
    theme = models.ForeignKey(SiteTheme, blank=False, null=False)

    def __unicode__(self):
        return '%s using skin %s' % (self.site.name, self.theme.name)
