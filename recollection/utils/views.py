from django.http import HttpResponseServerError
from django.template import loader, RequestContext
from urllib2 import urlopen

from django.core.cache import cache

from django.conf import settings
from urlparse import urljoin
from freemix.transform.conf import AKARA_URL_PREFIX

AKARA_VERSION_URL = getattr(settings, "AKARA_VERSION_URL", urljoin(AKARA_URL_PREFIX, "freemix.loader.revision"))

def server_error(request, template_name='500.html'):
    """
    500 error handler.

    Templates: `500.html`
    Context: None
    """
    t = loader.get_template(template_name)
    return HttpResponseServerError(t.render(RequestContext(request)))

def get_akara_version():
    version = cache.get("akara_version")
    if not version:
        version = cache_akara_version()
    return str(version)

def cache_akara_version():
    try:
        version = urlopen(AKARA_VERSION_URL).read(100)
    except:
        version = "Unknown"
    cache.set("akara_version", version, 60)
    return version