import logging
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import View
from django.views.generic.edit import CreateView
from freemix.dataset.transform import AkaraTransformClient
from freemix.dataset.views import create_form_view
from freemix.views import JSONResponse

from viewshare.apps.upload import forms, conf
from viewshare.apps.upload import models
import urllib2

logger = logging.getLogger(__name__)


create_cdm_view = create_form_view(models.ContentDMDataSource,
                                forms.ContentDMDataSourceForm,
                                "upload/cdm_datasource_form.html")


create_oai_view = create_form_view(model_class=models.OAIDataSource,
                               form_class=forms.OAIDataSourceForm,
                               form_template="upload/oai_datasource_form.html")


create_url_view = create_form_view(models.URLDataSource,
                               forms.URLDataSourceForm,
                               "upload/url_datasource_form.html")


create_file_view = create_form_view(models.FileDataSource,
                               forms.FileDataSourceForm,
                               "upload/file_datasource_form.html")


create_mods_url_view = create_form_view(models.ModsURLDataSource,
                               forms.ModsURLDataSourceForm,
                               "upload/modsurl_datasource_form.html")


create_mods_file_view = create_form_view(models.ModsFileDataSource,
                               forms.ModsFileDataSourceForm,
                               "upload/modsfile_datasource_form.html")


create_json_file_view = create_form_view(models.JSONFileDataSource,
                               forms.JSONFileDataSourceForm,
                               "upload/jsonfile_datasource_form.html")


create_json_url_view = create_form_view(models.JSONURLDataSource,
                               forms.JSONURLDataSourceForm,
                               "upload/jsonurl_datasource_form.html")


class OAISetListView(View):
    transform = AkaraTransformClient(conf.AKARA_OAIPMH_LIST_URL)

    @method_decorator(cache_page(60 * 15))
    def get(self, request, *args, **kwargs):
        url = request.GET.get("endpoint")
        try:
            result = self.transform(params={"endpoint": url})
        except Exception, ex:
            logger.error("Error loading OAI set list for %s: %s" % (url, ex))
            result = ()
        return JSONResponse(result)


class JSONPrepView(CreateView):
    transform = AkaraTransformClient(conf.AKARA_JSON_NAV_URL)

    @method_decorator(cache_page(60 * 15))
    def post(self, request, *args, **kwargs):
        url = request.POST.get("url")
        if url is None:
            body = request.FILES["file"]
        try:
            if url is not None:
                r = urllib2.urlopen(url)
                body = r.read()
            result = self.transform(body=body)
        except Exception, ex:
            logger.error("Error loading JSON analysis of %s: %s" % (url, ex))
            result = ()
        return JSONResponse(result)
