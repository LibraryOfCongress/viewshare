from django.conf import settings
from urlparse import urljoin
from freemix.transform.conf import AKARA_URL_PREFIX

AKARA_CONTENTDM_URL = getattr(settings, "AKARA_CONTENTDM_URL", urljoin(AKARA_URL_PREFIX, "contentdm.json"))
AKARA_OAIPMH_URL = getattr(settings, "AKARA_OAIPMH_URL", urljoin(AKARA_URL_PREFIX, "oaipmh.json"))
FILE_UPLOAD_PATH = getattr(settings, "FILE_UPLOAD_PATH", "/tmp/recollectionupload")