from django.conf import settings
from urlparse import urljoin
from freemix.dataset.transform import AKARA_URL_PREFIX

AKARA_CONTENTDM_URL = getattr(settings,
    "AKARA_CONTENTDM_URL",
    urljoin(AKARA_URL_PREFIX, "contentdm.json"))

AKARA_OAIPMH_URL = getattr(settings,
    "AKARA_OAI_URL",
    urljoin(AKARA_URL_PREFIX, "oai.listrecords.json"))

AKARA_OAIPMH_LIST_URL = getattr(settings,
    "AKARA_OAI_LIST_URL",
    urljoin(AKARA_URL_PREFIX, "oai.listsets.json"))

FILE_UPLOAD_PATH = getattr(settings,
    "FILE_UPLOAD_PATH",
    "/tmp/recollectionupload")

SITE_NAME = getattr(settings,
    "SITE_NAME",
    "Recollection")