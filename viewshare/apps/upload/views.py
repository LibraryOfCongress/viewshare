import logging
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import View
from freemix.dataset.transform import AkaraTransformClient
from freemix.dataset.views import DataSourceRegistry
from freemix.views import JSONResponse

from viewshare.apps.upload import forms, conf
from viewshare.apps.upload import models

logger = logging.getLogger(__name__)

DataSourceRegistry.register(models.ContentDMDataSource,
                            forms.ContentDMDataSourceForm,
                            "upload/cdm_datasource_form.html",
                            "upload/cdm_datasource_item.html")
create_cdm_view = DataSourceRegistry.create_view(models.ContentDMDataSource)

DataSourceRegistry.register(models.OAIDataSource,
                            forms.OAIDataSourceForm,
                            "upload/oai_datasource_form.html",
                            "upload/oai_datasource_item.html")
create_oai_view = DataSourceRegistry.create_view(models.OAIDataSource)

DataSourceRegistry.register(models.URLDataSource,
                            forms.URLDataSourceForm,
                            "upload/url_datasource_form.html",
                            "upload/url_datasource_item.html")
create_url_view = DataSourceRegistry.create_view(models.URLDataSource)

DataSourceRegistry.register(models.FileDataSource,
                            forms.FileDataSourceForm,
                            "upload/file_datasource_form.html",
                            "upload/file_datasource_item.html")
create_file_view = DataSourceRegistry.create_view(models.FileDataSource)

DataSourceRegistry.register(models.ModsURLDataSource,
                            forms.ModsURLDataSourceForm,
                            "upload/modsurl_datasource_form.html",
                            "upload/modsurl_datasource_item.html")
create_mods_url_view = DataSourceRegistry.create_view(models.ModsURLDataSource)

DataSourceRegistry.register(models.ModsFileDataSource,
                            forms.ModsFileDataSourceForm,
                            "upload/modsfile_datasource_form.html",
                            "upload/modsfile_datasource_item.html")
create_mods_file_view = DataSourceRegistry.create_view(models.ModsFileDataSource)


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
