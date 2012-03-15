import logging
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import View
from freemix.dataset.transform import AkaraTransformClient
from freemix.dataset.views import DataSourceFormRegistry
from freemix.views import JSONResponse

from viewshare.upload import forms, conf
from viewshare.upload import models

logger = logging.getLogger(__name__)



DataSourceFormRegistry.register(models.ContentDMDataSource,
                                forms.ContentDMDataSourceForm,
                                "upload/cdm_datasource_form.html")
create_cdm_view = DataSourceFormRegistry.create_view(models.ContentDMDataSource)


DataSourceFormRegistry.register(model_class=models.OAIDataSource,
                               form_class=forms.OAIDataSourceForm,
                               form_template="upload/oai_datasource_form.html")
create_oai_view = DataSourceFormRegistry.create_view(models.OAIDataSource)


DataSourceFormRegistry.register(model_class=models.URLDataSource,
                               form_class=forms.URLDataSourceForm,
                               form_template="upload/url_datasource_form.html")
create_url_view = DataSourceFormRegistry.create_view(models.URLDataSource)


DataSourceFormRegistry.register(model_class=models.FileDataSource,
                               form_class=forms.FileDataSourceForm,
                               form_template="upload/file_datasource_form.html")
create_file_view = DataSourceFormRegistry.create_view(models.FileDataSource)


DataSourceFormRegistry.register(model_class=models.ModsURLDataSource,
                               form_class=forms.ModsURLDataSourceForm,
                               form_template="upload/modsurl_datasource_form.html")
create_mods_url_view = DataSourceFormRegistry.create_view(models.ModsURLDataSource)


DataSourceFormRegistry.register(model_class=models.ModsFileDataSource,
                               form_class=forms.ModsFileDataSourceForm,
                               form_template="upload/modsfile_datasource_form.html")
create_mods_file_view =  DataSourceFormRegistry.create_view(models.ModsFileDataSource)


class OAISetListView(View):
    transform = AkaraTransformClient(conf.AKARA_OAIPMH_LIST_URL)

    @method_decorator(cache_page(60 * 15))
    def get(self, request, *args, **kwargs):
        url = request.GET.get("endpoint")
        try:
            result = self.transform(params = {"endpoint": url})
        except Exception, ex:
            logger.error("Error loading OAI set list for %s: %s"%(url,ex))
            result = ()
        return JSONResponse(result)
