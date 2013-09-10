import logging
import urllib2
from django.core.urlresolvers import reverse
from django.http import (Http404, HttpResponseRedirect,
                         HttpResponseServerError, HttpResponse)
from django.shortcuts import get_object_or_404, render
from django.utils.translation import ugettext_lazy as _


from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic.base import View
from django.views.generic.edit import CreateView, UpdateView
from freemix.exhibit.models import TX_STATUS
from freemix.permissions import PermissionsRegistry

from viewshare.apps.upload.transform import AkaraTransformClient
from freemix.views import JSONResponse
from viewshare.apps.upload import forms, conf
from viewshare.apps.upload import models


class CreateDataSourceView(CreateView):
    model_class = None
    form_class = None
    template_name = None

    def get_form_kwargs(self, **kwargs):
        kwargs = super(CreateDataSourceView, self).get_form_kwargs(**kwargs)
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        self.object = form.save()
        upload_transaction = models.UploadTransaction(source=self.object)
        upload_transaction.schedule()
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        exhibit = self.object.exhibit
        return reverse("upload_transaction_status",
                       kwargs={"owner": exhibit.owner, "slug": exhibit.slug})


class UpdateDataSourceView(UpdateView):

    def get_object(self, queryset=None):
        user = self.request.user
        owner = self.kwargs["owner"]
        slug = self.kwargs["slug"]
        source = get_object_or_404(models.DataSource,
                                   exhibit__owner__username=owner,
                                   exhibit__slug=slug)
        if not user.has_perm('datasource.can_edit', source):
            raise Http404
        return source.get_concrete()

    def get_form_class(self):
        source = self.get_object()
        return DataSourceRegistry.get_form_class(source)

    def get_template_names(self):
        return [DataSourceRegistry.get_form_template(self.get_object()),]

    def form_valid(self, form):
        self.object = form.save()
        upload_transaction = models.UploadTransaction(source=self.object)
        upload_transaction.schedule()
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        exhibit = self.get_object().exhibit
        return reverse("upload_transaction_status",
                       kwargs={"owner": exhibit.owner.username,
                               "slug": exhibit.slug})

    def get_context_data(self, **kwargs):
        context = super(UpdateDataSourceView, self).get_context_data()
        failure = self.object.transactions.filter(is_complete=False,
                                                  status=TX_STATUS["failure"])
        if failure.exists():
            context["show_error"] = True
            context["source"] = self.object
        return context


def pretty_print_transaction_status(status_id):
    """
    Return a description for a status given a 'status_id'
    """
    if status_id == TX_STATUS['pending']:
        status = _('Pending')
    elif status_id == TX_STATUS['scheduled']:
        status = _('Scheduled')
    elif status_id == TX_STATUS['running']:
        status = _('Running')
    elif status_id == TX_STATUS['success']:
        status = _('Successful')
    elif status_id == TX_STATUS['failure']:
        status = _('Failure')
    elif status_id == TX_STATUS['cancelled']:
        status = _('Cancelled')
    else:
        status = _('Unknown')

    return status


# Data Source Transaction Views
class UploadTransactionView(View):
    def redirect(self):
        status = self.transaction.status
        for key in TX_STATUS.keys():
            if status == TX_STATUS[key]:
                return getattr(self, key)()
        return HttpResponseServerError("Invalid transaction status for %s" %
                                       self.transaction.tx_id)

    def get(self, request, *args, **kwargs):

        print request.META["HTTP_ACCEPT"]

        owner = self.kwargs["owner"]
        slug = self.kwargs["slug"]
        source = get_object_or_404(models.DataSource,
                                   exhibit__owner__username=owner,
                                   exhibit__slug=slug).get_concrete()
        if not self.request.user.has_perm('datasource.can_edit', source):
            raise Http404

        self.transaction = source.open_transaction()
        self.source = source
        if request.META.get("HTTP_ACCEPT", "").find("application/json") >= 0:
            return self.json_response()

        return self.redirect()

    def display_transaction_result(self):
        """
        Render 'datasource_transaction_result'.
        """
        source = self.source

        template_name="upload/transaction_status.html"
        exhibit = source.exhibit

        return render(self.request, template_name, {
            "transaction": self.transaction,
            "exhibit": exhibit,
        })

    def get_success_url(self):
        exhibit = self.source.exhibit
        kwargs={"owner": exhibit.owner.username, "slug": exhibit.slug}
        return reverse("exhibit_edit", kwargs=kwargs)

    def success(self):
        return HttpResponseRedirect(self.get_success_url())

    def get_failure_url(self):
        exhibit = self.source.exhibit
        kwargs={"owner": exhibit.owner.username, "slug": exhibit.slug}
        return reverse("update_datasource", kwargs=kwargs)

    def failure(self):
        return HttpResponseRedirect(self.get_failure_url())

    def get_cancelled_url(self):
        return reverse('upload_dataset')

    def cancelled(self):
        return  HttpResponseRedirect(self.get_cancelled_url())

    def running(self):
        return self.display_transaction_result()

    def pending(self):
        return self.display_transaction_result()

    def scheduled(self):
        return self.display_transaction_result()

    def json_response(self):
        tx = self.transaction
        status = pretty_print_transaction_status(tx.status)
        response = {
            'status': unicode(status),
            'isReady': tx.is_ready()
        }
        if tx.status == TX_STATUS["failure"]:
            response["message"] = tx.result
            response["redirect"] = self.get_cancelled_url()
        elif tx.status == TX_STATUS["success"]:
            response["redirect"] = self.get_success_url()
        elif tx.status == TX_STATUS["cancelled"]:
            response["redirect"] = self.get_cancelled_url()
        return JSONResponse(response)


class FileDataSourceDownloadView(View):
    """Serve an uploaded file associated with a data source

    Currently this depends on nginx's X-Accel-Redirect functionality
    (http://wiki.nginx.org/XSendfile)

    TODO: Make this pluggable
    """
    def nginx_response(self, source):
        response = HttpResponse()
        url = '/fileuploads/%s' % source.file.name
        response["Content-Type"] = "application/binary"
        response["X-Accel-Redirect"] = url
        return response

    def naive_response(self,source):
        contents = source.file.read()
        response = HttpResponse(contents)
        response["Content-Type"] = "application/binary"

        return response

    def get(self, request, *args, **kwargs):
        owner = kwargs["owner"]
        slug = kwargs["slug"]
        source = get_object_or_404(models.DataSource,
                                   exhibit__owner__username=owner,
                                   exhibit__slug=slug)
        source = source.get_concrete()
        if not hasattr(source, "file"):
            raise Http404

        if not self.request.user.has_perm('datasource.can_view', source):
            raise Http404

        if conf.FILE_DOWNLOAD_NGINX_OPTIMIZATION:
            response = self.nginx_response(source)
        else:
            response = self.naive_response(source)

        response["Content-Disposition"] = ('attachment; filename=%s' %
                                          source.get_filename())

        return response


class DataSourceRegistry:
    _registry = {}

    @classmethod
    def register(cls, model_class, form_class, form_template, detail_template):
        key = model_class.__name__
        cls._registry[key] = (model_class, form_class, form_template, detail_template)

    @classmethod
    def create_view(cls, model_class):
        key = model_class.__name__
        entry = cls._registry.get(key)
        return CreateDataSourceView.as_view(model_class=entry[0],
                                            form_class=entry[1],
                                            template_name=entry[2])

    @classmethod
    def get_value(cls, instance, index):
        key = instance.__class__.__name__
        if key not in cls._registry:
            return None
        return cls._registry[key][index]

    @classmethod
    def get_form_class(cls, instance):
        return cls.get_value(instance, 1)

    @classmethod
    def get_form(cls, instance):
        form_class = cls.get_form_class(instance)
        return form_class(instance=instance)

    @classmethod
    def get_form_template(cls, instance):
        return cls.get_value(instance, 2)

    @classmethod
    def get_detail_template(cls, instance):
        return cls.get_value(instance, 3)


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

DataSourceRegistry.register(models.JSONFileDataSource,
                            forms.JSONFileDataSourceForm,
                            "upload/jsonfile_datasource_form.html",
                            "upload/jsonfile_datasource_item.html")
create_json_file_view = DataSourceRegistry.create_view(models.JSONFileDataSource)


DataSourceRegistry.register(models.JSONURLDataSource,
                            forms.JSONURLDataSourceForm,
                            "upload/jsonurl_datasource_form.html",
                            "upload/jsonurl_datasource_item.html")
create_json_url_view = DataSourceRegistry.create_view(models.JSONURLDataSource)


DataSourceRegistry.register(models.ReferenceDataSource,
                            forms.ReferenceDataSourceForm,
                            "upload/reference_datasource_form.html",
                            "upload/reference_datasource_item.html")
create_reference_url_view = DataSourceRegistry.create_view(models.ReferenceDataSource)


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
            else:
                raise Exception("No Data returned")
            result = self.transform(body=body)
        except Exception, ex:
            logger.error("Error loading JSON analysis of %s: %s" % (url, ex))
            result = ()
        return JSONResponse(result)
