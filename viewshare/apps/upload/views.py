import logging
import urllib2
from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponseRedirect, HttpResponseServerError, HttpResponse
from django.shortcuts import get_object_or_404, render

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.generic import DetailView, RedirectView, ListView
from django.views.generic.base import View
from django.views.generic.edit import CreateView, UpdateView
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

        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return reverse("datasource_refresh", kwargs={"uuid": self.object.uuid})


class DataSourceDetailView(DetailView):
    template_name = "dataset/datasource_detail.html"

    def get_object(self, queryset=None):
        uuid = self.kwargs["uuid"]

        ds = get_object_or_404(models.DataSource, uuid=uuid)
        if not self.request.user.has_perm("datasource.can_view", ds):
            raise Http404()
        return ds.get_concrete()

    def get_context_data(self, **kwargs):
        context = dict(super(DetailView, self).get_context_data(**kwargs))
        source = self.get_object()
        user = self.request.user
        filter = PermissionsRegistry.get_filter("datasource.can_view", user)

        context["can_view"] = user.has_perm("datasource.can_view", source),
        context["can_inspect"] = user.has_perm("datasource.can_inspect", source),

        context["can_build"] = user.has_perm("datasource.can_build", source)
        context["can_edit"] = user.has_perm("datasource.can_edit", source)
        context["can_delete"] = user.has_perm("datasource.can_delete", source)

        try:
            context["can_refresh"] = user.has_perm("datasource.can_edit", source)
        except ObjectDoesNotExist, ex:
            pass
        return context


class UpdateDataSourceView(UpdateView):

    def get_object(self, queryset=None):
        uuid = self.kwargs["uuid"]

        ds = get_object_or_404(models.DataSource, uuid=uuid)
        if not self.request.user.has_perm("datasource.can_edit", ds):
            raise Http404()
        return ds.get_concrete()

    def get_form_class(self):
        source = self.get_object()
        return DataSourceRegistry.get_form_class(source)

    def get_template_names(self):
        return [DataSourceRegistry.get_form_template(self.get_object()),]

    def form_valid(self, form):
        self.object = form.save()

        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return reverse("datasource_refresh", kwargs={"uuid": self.get_object().uuid})


class RedirectUpdateDataSourceView(RedirectView):
    def get_redirect_url(self, **kwargs):
        ds = get_object_or_404(models.Dataset, slug=self.kwargs["slug"], owner__username=self.kwargs["owner"])
        if not ds.source:
            raise Http404()
        return reverse("datasource_update", kwargs={"uuid": ds.source.uuid})


class PendingDataSourceListView(ListView):

    model = models.DataSource

    template_name = "dataset/datasource_list_pending.html"

    def get_queryset(self):
        return self.model.objects.filter(owner=self.request.user, dataset=None).order_by("-created")

datasource_list_pending = PendingDataSourceListView.as_view()


# Data Source Transaction Views
class DataSourceTransactionView(View):
    def redirect(self):
        status = self.transaction.status
        for key in models.TX_STATUS.keys():
            if status == models.TX_STATUS[key]:
                return getattr(self, key)()
        return HttpResponseServerError("Invalid transaction status for %s"%self.transaction.tx_id)

    def get(self, request, *args, **kwargs):
        uuid = kwargs["uuid"]
        user = request.user
        source = get_object_or_404(models.DataSource, uuid=uuid)
        if not user.has_perm('datasource.can_edit', source):
            raise Http404
        self.transaction = source.open_transaction()
        self.source = source
        return self.redirect()

    def display_transaction_result(self):
        """
        Render 'datasource_transaction_result'.
        """
        source = self.source
        save_url = None
        if source.dataset:
            template_name="dataset/dataset_update.html"
            dataset = source.dataset
            profile_url = reverse(
                    'dataset_profile_json',
                    kwargs={
                        'owner': dataset.owner.username,
                        'slug': dataset.slug
                        }
                    )
            cancel_url = reverse(
                    'dataset_summary',
                    kwargs={
                        'owner': dataset.owner.username,
                        'slug': dataset.slug
                        }
                    )
            save_url = reverse(
                    'dataset_edit',
                    kwargs={
                        'owner': source.dataset.owner.username,
                        'slug': source.dataset.slug
                        }
                    )
        else:
            template_name="dataset/dataset_create.html"
            save_url = reverse(
                    'datasource_transaction',
                    kwargs={"uuid": source.uuid}
                    )
            profile_url = reverse(
                    'datasource_transaction_result',
                    kwargs={'uuid': source.uuid}
                    )
            cancel_url = reverse('upload_dataset', kwargs={})
        dataurl = reverse(
                'datasource_transaction_result',
                kwargs={'uuid': source.uuid}
                )
        return render(self.request, template_name, {
            "transaction": self.transaction,
            "dataset": source.dataset,
            "save_url": save_url,
            "dataurl": dataurl,
            "profileurl": profile_url,
            "cancel_url": cancel_url
        })

    def success(self):
        return self.display_transaction_result()

    def failure(self):
        source = self.transaction.source.get_concrete()
        form = DataSourceRegistry.get_form(source)
        form_url = reverse("datasource_update", kwargs={"uuid": source.uuid})
        template_name = DataSourceRegistry.get_form_template(source)
        return render(self.request, template_name, {
            "form": form,
            "form_url": form_url,
            "object": source,
            "transaction": self.transaction,
            "show_error": True
        })

    def cancelled(self):
        return  HttpResponseRedirect(reverse('dataset_upload'))

    def running(self):
        return self.display_transaction_result()

    def pending(self):
        return self.display_transaction_result()

    def scheduled(self):
        return self.display_transaction_result()


class DataSourceTransactionResultView(View):
    """
    Return the JSON document representing the result of a DataSourceTransaction
    """
    def get(self, request, *args, **kwargs):
        uuid = kwargs["uuid"]
        source = get_object_or_404(models.DataSource, uuid=uuid)
        if not self.request.user.has_perm('datasource.can_edit', source):
            raise Http404
        tx = source.open_transaction()
        return JSONResponse(tx.result)


class RefreshDataSourceView(View):
    """
    Force the creation of a new DataSourceTransaction
    """
    def get(self, request, *args, **kwargs):
        uuid = kwargs["uuid"]
        source = get_object_or_404(models.DataSource, uuid=uuid)
        if not self.request.user.has_perm('datasource.can_edit', source):
            raise Http404
        source.create_transaction()
        return HttpResponseRedirect(reverse("datasource_transaction",
                                            kwargs={
                                                "uuid": uuid
                                            }))


class DataSourceTransactionStatusView(View):
    """
    Return a status string for the open DataSourceTransaction for the
    given data source.

    Useful for polling from the client. Also return a boolean indicating if
    the DataSourceTransaction's status will continue to change.
    """
    def get(self, request, *args, **kwargs):
        uuid = kwargs["uuid"]
        source = get_object_or_404(models.DataSource, uuid=uuid)
        if not self.request.user.has_perm('datasource.can_edit', source):
            raise Http404

        tx = source.open_transaction()
        if tx.is_complete:
            raise Http404

        status = pretty_print_transaction_status(tx.status)

        return JSONResponse({
            'status': unicode(status),
            'isReady': tx.is_ready()})


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

        response["Content-Disposition"] = 'attachment; filename=%s' % source.get_filename()

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
