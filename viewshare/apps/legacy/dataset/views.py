#import json
#from django.core.exceptions import ObjectDoesNotExist
#from django.core.urlresolvers import reverse
#from django.db import transaction
#from django.db.models.query_utils import Q
#from django.http import (
#        HttpResponse,
#        HttpResponseRedirect,
#        HttpResponseServerError,
#        Http404,
#        HttpResponseForbidden
#        )
#from django.shortcuts import get_object_or_404, render
#from django.views.decorators.http import  last_modified
#from django.views.generic.base import View, RedirectView
#from django.utils.translation import ugettext_lazy as _
#from django.views.generic.detail import DetailView
#from django.views.generic.edit import CreateView, UpdateView
#from django.views.generic.list import ListView
#
#from viewshare.apps.legacy.dataset import models
#from viewshare.apps.legacy.dataset.utils import pretty_print_transaction_status
#from freemix.permissions import PermissionsRegistry
#from freemix.views import (
#        OwnerListView,
#        OwnerSlugPermissionMixin,
#        JSONResponse,
#        BaseJSONView
#        )
#
#
##----------------------------------------------------------------------------------------------------------------------#
## Data Profile Views
#from viewshare.apps.legacy.dataset import forms, conf
#
#
#def get_request_instance(request, *args, **kwargs):
#    if not hasattr(request, "parent_object"):
#        owner = kwargs["owner"]
#        slug = kwargs["slug"]
#        request.parent_object = get_object_or_404(models.Dataset, owner__username=owner, slug=slug)
#    return request.parent_object
#
#
#class DatasetJSONView(BaseJSONView):
#    model = None
#
#    def get_doc(self):
#        ds = self.get_parent_object()
#        return  self.model.objects.filter(dataset=ds).values_list("data")[0][0]
#
#    def get_parent_object(self):
#        return get_request_instance(self.request, *self.args, **self.kwargs)
#
#    def check_perms(self):
#        if not self.request.user.has_perm("dataset.can_view", self.get_parent_object()):
#            return False
#        return True
#
#    def cache_control_header(self):
#        cache_control = super(DatasetJSONView, self).cache_control_header()
#        if not self.get_parent_object().published:
#            cache_control += ", private"
#        else:
#            cache_control += ", public"
#        return cache_control
#
#
#lmdec = last_modified(lambda request, *args, **kwargs: get_request_instance(request, *args, **kwargs).modified)
#
#dataset_profile_json = lmdec(DatasetJSONView.as_view(model=models.DatasetProfile))
#
#dataset_data_json = lmdec(DatasetJSONView.as_view(model=models.DatasetJSONFile))
#
#dataset_properties_json = lmdec(DatasetJSONView.as_view(model=models.DatasetPropertiesCache))
#
#dataset_list_by_owner = OwnerListView.as_view(template_name="dataset/dataset_list_by_owner.html",
#                                               model=models.Dataset,
#                                               permission = "dataset.can_view",
#                                               related=("exhibits","owner"))
#
##----------------------------------------------------------------------------------------------------------------------#
## Dataset views
#
#
#class DatasetView(OwnerSlugPermissionMixin, DetailView):
#
#    model = models.Dataset
#    object_perm = "dataset.can_view"
#    template_name = "dataset/dataset_summary.html"
#
#    def get_queryset(self):
#        return self.model.objects.select_related("owner", "source")
#
#    def get_context_data(self, **kwargs):
#        context = dict(super(DatasetView, self).get_context_data(**kwargs))
#        dataset = self.get_object(models.Dataset.objects.select_related("source"))
#        user = self.request.user
#        filter = PermissionsRegistry.get_filter("dataset.can_view", user)
#
#        context["can_view"] = user.has_perm("dataset.can_view", dataset),
#        context["can_inspect"] = user.has_perm("dataset.can_inspect", dataset),
#
#        context["can_build"] = user.has_perm("dataset.can_build", dataset)
#        context["can_edit"] = user.has_perm("dataset.can_edit", dataset)
#        context["can_delete"] = user.has_perm("dataset.can_delete", dataset)
#
#        try:
#            source = dataset.source
#            context["can_refresh"] = user.has_perm("datasource.can_edit", source)
#        except ObjectDoesNotExist, ex:
#            pass
#        context["exhibits"] = dataset.exhibits.filter(filter)
#        return context
#
#
#class DatasetSummaryView(DatasetView):
#    template_name = "dataset/dataset_summary.html"
#
#    def delete(self, request, *args, **kwargs):
#        ds = self.get_object()
#
#        if request.user.has_perm("dataset.can_delete", ds):
#            for exhibit in ds.exhibits.filter(~Q(owner__username=self.kwargs["owner"])):
#                exhibit.dataset = None
#                exhibit.save()
#            ds.delete()
#            return HttpResponse(_("%(file_id)s deleted") % {'file_id': ds.get_absolute_url()})
#        return HttpResponseForbidden()
#
#
#class DatasetDetailView(DatasetView):
#    template_name = "dataset/dataset_detail.html"
#    object_perm = "dataset.can_inspect"
#
#
#class DatasetCreateFormView(CreateView):
#    form_class = forms.CreateDatasetForm
#    template_name = "dataset/create/dataset_metadata_form.html"
#
#    def get_success_url(self):
#        owner = getattr(self.object.owner, "username", None)
#        return reverse('dataset_create_success',
#                       kwargs={"owner": owner,
#                               "slug": self.object.slug})
#
#    def get_context_data(self, **kwargs):
#        ctx = super(DatasetCreateFormView, self).get_context_data(**kwargs)
#        ctx["uuid"] = self.kwargs["uuid"]
#        return ctx
#
#    def get_form_kwargs(self):
#        kwargs = super(DatasetCreateFormView, self).get_form_kwargs()
#        del kwargs["instance"]
#        kwargs["owner"] = self.request.user
#        tx = get_object_or_404(models.DataSourceTransaction,
#                               source__uuid=self.kwargs["uuid"],
#                               is_complete=False)
#        kwargs["datasource_transaction"] = tx
#        return kwargs
#
#    def get_initial(self):
#        initial = dict(super(DatasetCreateFormView, self).get_initial())
#        source = get_object_or_404(models.DataSource, uuid=self.kwargs["uuid"])
#        if source:
#            source = source.get_concrete()
#        if hasattr(source, "title"):
#            initial["title"] = getattr(source, "title")
#
#        return initial
#
#    def form_valid(self, form):
#        self.object = form.save()
#        return HttpResponseRedirect(self.get_success_url())
#
#
#class DatasetDetailEditView(OwnerSlugPermissionMixin, UpdateView):
#    form_class = forms.EditDatasetDetailForm
#    object_perm="dataset.can_edit"
#    model = models.Dataset
#    template_name = "dataset/edit/dataset_metadata_form.html"
#
#    def form_valid(self, form):
#        self.object = form.save()
#        return render(self.request, "dataset/detail/dataset_metadata.html", {
#                "can_edit": True,
#                "object": self.object,
#                "is_saved": True
#            })
#
#
#class DatasetProfileEditView(OwnerSlugPermissionMixin, View):
#    object_perm="dataset.can_edit"
#    template_name="dataset/dataset_update.html"
#
#    def get(self, request, *args, **kwargs):
#        dataset = self.get_object()
#        ds_kwargs = {'owner': dataset.owner.username, 'slug': dataset.slug}
#        context = {
#            "dataset": dataset,
#            "dataurl": reverse('dataset_data_json', kwargs=ds_kwargs),
#            "profileurl": reverse('dataset_profile_json', kwargs=ds_kwargs),
#            "cancel_url": reverse('dataset_summary', kwargs=ds_kwargs),
#            "save_url": reverse('dataset_edit', kwargs=ds_kwargs),
#            "datasource_refresh": reverse(
#                "datasource_update", kwargs={"uuid": dataset.source.uuid})
#        }
#
#        user = self.request.user
#        filter = PermissionsRegistry.get_filter("dataset.can_view", user)
#
#        context["can_view"] = user.has_perm("dataset.can_view", dataset),
#        context["can_inspect"] = user.has_perm("dataset.can_inspect", dataset),
#
#        context["can_build"] = user.has_perm("dataset.can_build", dataset)
#        context["can_edit"] = user.has_perm("dataset.can_edit", dataset)
#        context["can_delete"] = user.has_perm("dataset.can_delete", dataset)
#        context["exhibits"] = dataset.exhibits.filter(filter)
#
#        response = render(request, self.template_name, context)
#
#        return response
#
#    def post(self, request, *args, **kwargs):
#        try:
#            data = json.loads(request.raw_post_data)
#            if not data.has_key("properties") or not data.has_key("items"):
#                return HttpResponseServerError("Invalid Request")
#            with transaction.commit_on_success():
#                ds = self.get_object()
#                ds.update_profile({"properties": data["properties"]})
#                ds.update_data({"items": data["items"]})
#                ds.save()
#            return render(request, "dataset/edit/success.html", {
#                "owner": ds.owner.username,
#                "slug": ds.slug
#            })
#
#        except Exception, ex:
#            return HttpResponseServerError("Invalid Request")
#
#
#    def get_queryset(self):
#        return models.Dataset.objects.all()
#
#
## Data Source Views
#
