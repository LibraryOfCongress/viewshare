import logging
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import View
from django.views.generic.edit import CreateView
from freemix.dataset.transform import AkaraTransformClient
from freemix.views import JSONResponse

from recollection.upload import forms, conf
from recollection.upload import models

logger = logging.getLogger(__name__)

class CreateDataSourceView(CreateView):
    model_class = models.ContentDMDataSource
    form_class = forms.ContentDMDataSourceForm
    template_name = "recollection/upload/datasource_form.html"

    def get_form_kwargs(self, **kwargs):
        kwargs = super(CreateDataSourceView, self).get_form_kwargs(**kwargs)
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        self.object = form.save()

        self.tx = self.object.create_transaction(self.request.user)

        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return self.tx.get_absolute_url()

    
create_cdm_view = CreateDataSourceView.as_view(model_class=models.ContentDMDataSource,
                                               form_class=forms.ContentDMDataSourceForm,
                                               template_name="recollection/upload/cdm_datasource_form.html")

create_oai_view = CreateDataSourceView.as_view(model_class=models.OAIDataSource,
                                               form_class=forms.OAIDataSourceForm,
                                               template_name="recollection/upload/oai_datasource_form.html")

create_url_view = CreateDataSourceView.as_view(model_class=models.URLDataSource,
                                               form_class=forms.URLDataSourceForm,
                                               template_name="recollection/upload/url_datasource_form.html")


create_file_view = CreateDataSourceView.as_view(model_class=models.FileDataSource,
                                               form_class=forms.FileDataSourceForm,
                                               template_name="recollection/upload/file_datasource_form.html")


create_mods_url_view = CreateDataSourceView.as_view(model_class=models.ModsURLDataSource,
                                               form_class=forms.ModsURLDataSourceForm,
                                               template_name="recollection/upload/modsurl_datasource_form.html")


create_mods_file_view = CreateDataSourceView.as_view(model_class=models.ModsFileDataSource,
                                               form_class=forms.ModsFileDataSourceForm,
                                               template_name="recollection/upload/modsfile_datasource_form.html")


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
