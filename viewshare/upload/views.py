import logging
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import View
from freemix.dataset.transform import AkaraTransformClient
from freemix.dataset.views import create_form_view
from freemix.views import JSONResponse

from viewshare.upload import forms, conf
from viewshare.upload import models

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
