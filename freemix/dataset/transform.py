"""Views for loading data from an external source"""
import logging
import uuid

from django.http import  HttpResponseBadRequest
from django.views.generic.base import View
import urllib2
from urllib import urlencode

from django.utils import simplejson as json
from freemix.views import JSONResponse


from django.conf import settings
from urlparse import urljoin


logger = logging.getLogger(__name__)


AKARA_URL_PREFIX = getattr(settings, "AKARA_URL_PREFIX", "http://transformer.zepheira.com:8883")
AKARA_TRANSFORM_URL = getattr(settings, "AKARA_TRANSFORM_URL", urljoin(AKARA_URL_PREFIX, "freemix.json"))


class AkaraTransformClient(object):
    def __init__(self, url, credentials=None):
        self.url = url
        self.credentials = credentials

    def __call__(self, params=None, body=None):
        url = self.url
        if params:
            url = "%s?%s"%(url, urlencode(params))
        
        if self.credentials:
            auth_handler = urllib2.HTTPDigestAuthHandler()
            auth_handler.add_password(realm=self.credentials[0],
                                      uri=self.url,
                                      user=self.credentials[1],
                                      passwd=self.credentials[2])
            opener = urllib2.build_opener(auth_handler)
        else:
            opener = urllib2.build_opener()
        logger.debug("Transformation request for %s"%url)
        r = urllib2.Request(url, body)
        data = json.load(opener.open(r))
        return data


class TransformView(View):
    """Generic transform proxy

    By default, posted data is sent directly to the provided client.  If the
    request included a `X-Data-Load-TxId` header, it will be included in the
    response as well.
    """

    transform = AkaraTransformClient(AKARA_TRANSFORM_URL)

    def dispatch(self, request, *args, **kwargs):
        # Extract client provide transaction ID and append it to the response
        self.txid = request.META.get("HTTP_X_DATA_LOAD_TXID", str(uuid.uuid4()))
        response = super(TransformView, self).dispatch(request, args, kwargs)
        response["X-Data-Load-TxId"] = self.txid
        return response

    def get_params(self):
        return dict()

    def get_body(self):
        return None


class RawTransformView(TransformView):
    def get_body(self):
        return self.request.raw_post_data

    def post(self, request, *args, **kwargs):
        body =  self.get_body()
        data = self.transform(body=body, params=self.get_params())
        if data:
            return JSONResponse(data)
        return HttpResponseBadRequest()

    def get_body(self):
        return self.request.raw_post_data
