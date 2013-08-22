from urlparse import urljoin

from django.conf import settings

from viewshare.apps.upload.transform import AKARA_URL_PREFIX


AKARA_CONTENTDM_URL = getattr(settings,
    "AKARA_CONTENTDM_URL",
    urljoin(AKARA_URL_PREFIX, "contentdm.json"))

AKARA_OAIPMH_URL = getattr(settings,
    "AKARA_OAI_URL",
    urljoin(AKARA_URL_PREFIX, "oai.listrecords.json"))

AKARA_OAIPMH_LIST_URL = getattr(settings,
    "AKARA_OAI_LIST_URL",
    urljoin(AKARA_URL_PREFIX, "oai.listsets.json"))

AKARA_JSON_NAV_URL = getattr(settings,
    "AKARA_JSON_NAV_URL",
    urljoin(AKARA_URL_PREFIX, "json.nav.prep"))

AKARA_JSON_EXTRACT_URL = getattr(settings,
    "AKARA_JSON_EXTRACT_URL",
    urljoin(AKARA_URL_PREFIX, "load.extract.json"))

FILE_UPLOAD_PATH = getattr(settings,
    "FILE_UPLOAD_PATH",
    "/tmp/viewshareupload")

SITE_NAME = getattr(settings,
    "SITE_NAME",
    "Viewshare")

FILE_DOWNLOAD_NGINX_OPTIMIZATION = getattr(settings,
                                           "FILE_DOWNLOAD_NGINX_OPTIMIZATION",
                                           False)
