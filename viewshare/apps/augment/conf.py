from urlparse import urljoin

from django.conf import settings

from viewshare.apps.upload.transform import AKARA_URL_PREFIX


AKARA_AUGMENT_URL = getattr(settings, "AKARA_AUGMENT_URL",
                            urljoin(AKARA_URL_PREFIX, "augment.freemix.json"))
