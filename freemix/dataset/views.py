from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.db import transaction
from django.db.models.query_utils import Q
from django.http import (
        HttpResponse,
        HttpResponseRedirect,
        HttpResponseServerError,
        Http404,
        HttpResponseForbidden
        )
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import  last_modified
from django.views.generic.base import View, RedirectView
from django.utils import simplejson as json
from django.utils.translation import ugettext_lazy as _
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.list import ListView

from freemix.dataset import conf, forms, models
from freemix.dataset.utils import pretty_print_transaction_status
from freemix.permissions import PermissionsRegistry
from freemix.views import (
        OwnerListView,
        OwnerSlugPermissionMixin,
        JSONResponse,
        BaseJSONView
        )


#----------------------------------------------------------------------------------------------------------------------#
# Data Profile Views

def get_request_instance(request, *args, **kwargs):
    if not hasattr(request, "parent_object"):
        owner = kwargs["owner"]
        slug = kwargs["slug"]
        request.parent_object = get_object_or_404(models.Dataset, owner__username=owner, slug=slug)
    return request.parent_object


class DatasetJSONView(BaseJSONView):
    model = None

    def get_doc(self):
        ds = self.get_parent_object()
        return  self.model.objects.filter(dataset=ds).values_list("data")[0][0]

    def get_parent_object(self):
        return get_request_instance(self.request, *self.args, **self.kwargs)

    def check_perms(self):
        if not self.request.user.has_perm("dataset.can_view", self.get_parent_object()):
            return False
        return True

    def cache_control_header(self):
        cache_control = super(DatasetJSONView, self).cache_control_header()
        if not self.get_parent_object().published:
            cache_control += ", private"
        else:
            cache_control += ", public"
        return cache_control


lmdec = last_modified(lambda request, *args, **kwargs: get_request_instance(request, *args, **kwargs).modified)

dataset_profile_json = lmdec(DatasetJSONView.as_view(model=models.DatasetProfile))

dataset_data_json = lmdec(DatasetJSONView.as_view(model=models.DatasetJSONFile))

dataset_properties_json = lmdec(DatasetJSONView.as_view(model=models.DatasetPropertiesCache))

dataset_list_by_owner = OwnerListView.as_view(template_name="dataset/dataset_list_by_owner.html",
                                               model=models.Dataset,
                                               permission = "dataset.can_view",
                                               related=("exhibits","owner"))

#----------------------------------------------------------------------------------------------------------------------#
# Dataset views


class DatasetView(OwnerSlugPermissionMixin, DetailView):

    model = models.Dataset
    object_perm = "dataset.can_view"
    template_name = "dataset/dataset_summary.html"

    def get_queryset(self):
        return self.model.objects.select_related("owner", "source")

    def get_context_data(self, **kwargs):
        context = dict(super(DatasetView, self).get_context_data(**kwargs))
        dataset = self.get_object(models.Dataset.objects.select_related("source"))
        user = self.request.user
        filter = PermissionsRegistry.get_filter("dataset.can_view", user)

        context["can_view"] = user.has_perm("dataset.can_view", dataset),
        context["can_inspect"] = user.has_perm("dataset.can_inspect", dataset),

        context["can_build"] = user.has_perm("dataset.can_build", dataset)
        context["can_edit"] = user.has_perm("dataset.can_edit", dataset)
        context["can_delete"] = user.has_perm("dataset.can_delete", dataset)

        try:
            source = dataset.source
            context["can_refresh"] = user.has_perm("datasource.can_edit", source)
        except ObjectDoesNotExist, ex:
            pass
        context["exhibits"] = dataset.exhibits.filter(filter)
        return context


class DatasetSummaryView(DatasetView):
    template_name = "dataset/dataset_summary.html"

    def delete(self, request, *args, **kwargs):
        ds = self.get_object()

        if request.user.has_perm("dataset.can_delete", ds):
            for exhibit in ds.exhibits.filter(~Q(owner__username=self.kwargs["owner"])):
                exhibit.dataset = None
                exhibit.save()
            ds.delete()
            return HttpResponse(_("%(file_id)s deleted") % {'file_id': ds.get_absolute_url()})
        return HttpResponseForbidden()


class DatasetDetailView(DatasetView):
    template_name = "dataset/dataset_detail.html"
    object_perm = "dataset.can_inspect"


class DatasetCreateFormView(CreateView):
    form_class = forms.CreateDatasetForm
    template_name = "dataset/create/dataset_metadata_form.html"

    def get_success_url(self):
        owner = getattr(self.object.owner, "username", None)
        return reverse('dataset_create_success',
                       kwargs={"owner": owner,
                               "slug": self.object.slug})

    def get_context_data(self, **kwargs):
        ctx = super(DatasetCreateFormView, self).get_context_data(**kwargs)
        ctx["uuid"] = self.kwargs["uuid"]
        return ctx

    def get_form_kwargs(self):
        kwargs = super(DatasetCreateFormView, self).get_form_kwargs()
        del kwargs["instance"]
        kwargs["owner"] = self.request.user
        tx = get_object_or_404(models.DataSourceTransaction,
                               source__uuid=self.kwargs["uuid"],
                               is_complete=False)
        kwargs["datasource_transaction"] = tx
        return kwargs

    def get_initial(self):
        initial = dict(super(DatasetCreateFormView, self).get_initial())
        source = get_object_or_404(models.DataSource, uuid=self.kwargs["uuid"])
        if source:
            source = source.get_concrete()
        if hasattr(source, "title"):
            initial["title"] = getattr(source, "title")

        return initial

    def form_valid(self, form):
        self.object = form.save()
        tx = get_object_or_404(models.DataSourceTransaction,
                               source__uuid=self.kwargs["uuid"],
                               is_complete=False)
        tx.complete()
        return HttpResponseRedirect(self.get_success_url())


class DatasetDetailEditView(OwnerSlugPermissionMixin, UpdateView):
    form_class = forms.EditDatasetDetailForm
    object_perm="dataset.can_edit"
    model = models.Dataset
    template_name = "dataset/edit/dataset_metadata_form.html"

    def form_valid(self, form):
        self.object = form.save()
        return render(self.request, "dataset/detail/dataset_metadata.html", {
                "can_edit": True,
                "object": self.object,
                "is_saved": True
            })


class DatasetProfileEditView(OwnerSlugPermissionMixin, View):
    object_perm="dataset.can_edit"
    template_name="dataset/dataset_update.html"

    def get(self, request, *args, **kwargs):
        dataset = self.get_object()
        ds_kwargs = {'owner': dataset.owner.username, 'slug': dataset.slug}
        context = {
            "dataset": dataset,
            "dataurl": reverse('dataset_data_json', kwargs=ds_kwargs),
            "profileurl": reverse('dataset_profile_json', kwargs=ds_kwargs),
            "cancel_url": reverse('dataset_summary', kwargs=ds_kwargs),
            "save_url": reverse('dataset_edit', kwargs=ds_kwargs),
        }

        user = self.request.user
        filter = PermissionsRegistry.get_filter("dataset.can_view", user)

        context["can_view"] = user.has_perm("dataset.can_view", dataset),
        context["can_inspect"] = user.has_perm("dataset.can_inspect", dataset),

        context["can_build"] = user.has_perm("dataset.can_build", dataset)
        context["can_edit"] = user.has_perm("dataset.can_edit", dataset)
        context["can_delete"] = user.has_perm("dataset.can_delete", dataset)
        context["exhibits"] = dataset.exhibits.filter(filter)

        response = render(request, self.template_name, context)

        return response

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.raw_post_data)
            if not data.has_key("properties") or not data.has_key("items"):
                return HttpResponseServerError("Invalid Request")
            with transaction.commit_on_success():
                ds = self.get_object()
                ds.update_profile({"properties": data["properties"]})
                ds.update_data({"items": data["items"]})
                ds.save()
            return render(request, "dataset/edit/success.html", {
                "owner": ds.owner.username,
                "slug": ds.slug
            })

        except Exception, ex:
            return HttpResponseServerError("Invalid Request")


    def get_queryset(self):
        return models.Dataset.objects.all()


# Data Source Views

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
        uuid = kwargs["uuid"]

        source = get_object_or_404(models.DataSource, uuid=uuid)
        source = source.get_concrete()
        if not hasattr(source, "file"):
            raise Http404

        if not self.request.user.has_perm('datasource.can_edit', source):
            raise Http404

        if conf.FILE_DOWNLOAD_NGINX_OPTIMIZATION:
            response = self.nginx_response(source)
        else:
            response = self.naive_response(source)

        response["Content-Disposition"] = 'attachment; filename=%s' % source.get_filename()

        return response
