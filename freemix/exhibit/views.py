from django.contrib.auth.decorators import login_required

from django.utils.translation import ugettext_lazy as _

from django.http import *
from django.views.generic.base import View
from django.shortcuts import render_to_response, get_object_or_404, render
from django.template import RequestContext
from django.template.loader import render_to_string
from django.core.urlresolvers import  reverse
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.list import ListView

from freemix.exhibit import models, forms, conf
from freemix.dataset.models import Dataset
from freemix.exhibit.models import Canvas
from freemix.permissions import PermissionsRegistry
from freemix.utils import get_site_url

from django.utils import simplejson as json
import uuid
from freemix.views import JSONResponse, OwnerListView, OwnerSlugPermissionMixin


# Edit Views
class ExhibitCreateFormView(CreateView):
    form_class = forms.CreateExhibitForm
    template_name = "exhibit/create/exhibit_metadata_form.html"

    def get_success_url(self):
        owner = getattr(self.object.owner, "username", None)
        return reverse('exhibit_create_success',
                       kwargs={"owner": owner,
                               "slug": self.object.slug})

    def get_context_data(self, **kwargs):
        ctx = super(ExhibitCreateFormView, self).get_context_data(**kwargs)
        ctx["owner"] = self.kwargs["owner"]
        ctx["slug"] = self.kwargs["slug"]
        ctx["canvas"] = self.kwargs["canvas"]
        return ctx

    def get_form_kwargs(self):
        kwargs = super(ExhibitCreateFormView, self).get_form_kwargs()
        kwargs["owner"] = self.request.user
        dataset = get_object_or_404(Dataset, owner__username=self.kwargs["owner"], slug=self.kwargs["slug"])
        kwargs["dataset"] = dataset
        kwargs["canvas"] = get_object_or_404(Canvas, slug=self.kwargs["canvas"])
        return kwargs

    def get_initial(self):
        initial = dict(super(ExhibitCreateFormView, self).get_initial())
        dataset = get_object_or_404(Dataset, owner__username=self.kwargs["owner"], slug=self.kwargs["slug"])

        initial["title"] = getattr(dataset, "title")
        return initial

    def form_valid(self, form):
        if not self.request.user.has_perm("dataset.can_view", form.dataset):
            return HttpResponseForbidden()
        self.object = form.save()
        return HttpResponseRedirect(self.get_success_url())

class ExhibitDetailEditView(OwnerSlugPermissionMixin, UpdateView):
    form_class = forms.UpdateExhibitDetailForm
    object_perm="exhibit.can_edit"
    model = models.Exhibit
    template_name = "exhibit/edit/exhibit_metadata_form.html"

    def form_valid(self, form):
        self.object = form.save()
        return render(self.request, "exhibit/detail/exhibit_metadata.html", {
                "can_edit": True,
                "object": self.object,
                "is_saved": True
            })


class ExhibitCreateView(View):

    template_name="exhibit/exhibit_create.html"

    def check_permissions(self):
        return self.request.user.has_perm("dataset.can_view", self.dataset)

    def get(self, request, *args, **kwargs):
        self.dataset_args = {"owner": self.kwargs["owner"], "slug": self.kwargs["slug"]}
        self.dataset = get_object_or_404(Dataset,owner__username=self.kwargs["owner"], slug=self.kwargs["slug"])
        if not self.check_permissions():
            raise Http404()

        profile_url = reverse("exhibit_profile_template", kwargs=self.dataset_args)
        dataset_profile_url = reverse("dataset_profile_json", kwargs=self.dataset_args)
        data_url = reverse("dataset_data_json", kwargs=self.dataset_args)
        dataset_properties_cache = reverse("dataset_properties_cache_json", kwargs=self.dataset_args)
        canvas = get_object_or_404(models.Canvas,
                                   slug=self.request.GET.get("canvas", conf.DEFAULT_EXHIBIT_CANVAS))
        save_form_url = reverse("exhibit_create_form", kwargs={
            "owner": self.dataset.owner,
            "slug": self.dataset.slug,
            "canvas": canvas.slug
        })
        

        return render(request, self.template_name, {
            "exhibit_profile_url": profile_url,
            "dataset_profile_url": dataset_profile_url,
            "dataset_properties_cache_json": dataset_properties_cache,
            "cancel_url": self.dataset.get_absolute_url(),
            "save_form_url": save_form_url,
            "data_url":data_url,
            "canvas": canvas,
            "dataset": self.dataset,
            "owner": request.user.username,
            "can_edit_dataset": request.user.has_perm("dataset.can_edit", self.dataset)

        })


class ExhibitProfileUpdateView(View):
    template_name="exhibit/exhibit_update.html"

    def check_permissions(self):
        return self.request.user.has_perm("exhibit.can_edit", self.exhibit)

    def setup(self):
        self.exhibit = get_object_or_404(models.Exhibit, owner__username=self.kwargs["owner"],
                                         slug=self.kwargs["slug"])
        self.dataset = self.exhibit.dataset
        self.dataset_args = {"owner": self.dataset.owner.username, "slug": self.dataset.slug}

    def get(self, request, *args, **kwargs):
        self.setup()

        profile_url = reverse("exhibit_profile_json", kwargs={"owner": self.kwargs["owner"],
                                                       "slug": self.kwargs["slug"]})
        dataset_profile_url = reverse("dataset_profile_json", kwargs=self.dataset_args)
        dataset_properties_cache = reverse("dataset_properties_cache_json", kwargs=self.dataset_args)

        data_url = reverse("dataset_data_json", kwargs=self.dataset_args)
        canvas = self.exhibit.canvas

        if not self.check_permissions():
            raise Http404()

        context = {
            "exhibit_profile_url": profile_url,
            "dataset_profile_url": dataset_profile_url,
            "dataset_properties_cache_json": dataset_properties_cache,

            "cancel_url": self.exhibit.get_absolute_url(),
            "data_url": data_url,
            "canvas": canvas,
            "owner": request.user.username,
            "dataset": self.dataset,
            "exhibit": self.exhibit
        }

        user = self.request.user
        exhibit = self.exhibit

        context["dataset_available"] = exhibit.dataset_available(user)
        context["can_edit_dataset"] = user.has_perm("dataset.can_edit", self.dataset)
        context["can_view"] = user.has_perm("exhibit.can_view", exhibit)
        context["can_inspect"] = user.has_perm("exhibit.can_inspect", exhibit)

        context["can_edit"] = user.has_perm("exhibit.can_edit", exhibit)
        context["can_delete"] = user.has_perm("exhibit.can_delete", exhibit)
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        self.setup()
        user = request.user

        if not self.check_permissions():
            raise Http404()

        contents = json.loads(self.request.raw_post_data)
        self.exhibit.update_from_profile(contents)
        url = self.exhibit.get_absolute_url()
        return render(request, "exhibit/edit/success.html", {
            "owner": self.exhibit.owner.username,
            "slug": self.exhibit.slug
        })

#############################################################################################
# Display Views

class ExhibitView(OwnerSlugPermissionMixin, DetailView):

    model = models.Exhibit
    object_perm = "exhibit.can_view"
    template_name = "exhibit/exhibit_display.html"

    def get_context_data(self, **kwargs):
        context = super(ExhibitView, self).get_context_data(**kwargs)
        user = self.request.user
        exhibit = self.get_object()

        context["exhibit"] = exhibit
        context["dataset_available"] = exhibit.dataset_available(user)
        context["can_view"] = user.has_perm("exhibit.can_view", exhibit)
        context["can_inspect"] = user.has_perm("exhibit.can_inspect", exhibit)

        context["can_edit"] = user.has_perm("exhibit.can_edit", exhibit)
        context["can_delete"] = user.has_perm("exhibit.can_delete", exhibit)
        return context

class ExhibitDisplayView(ExhibitView):

    def delete(self, request, *args, **kwargs):
        exhibit = self.get_object()
        if request.user.has_perm("exhibit.can_delete", exhibit):
            exhibit.delete()
            return HttpResponse(_("%s deleted") % exhibit.get_absolute_url())
        return HttpResponseForbidden()

    def get_context_data(self, **kwargs):
        context = super(ExhibitDisplayView, self).get_context_data(**kwargs)
        user = self.request.user
        can_embed = user.has_perm("exhibit.can_embed", self.get_object())
        context["can_embed"] = can_embed
        context["can_share"] = user.has_perm("exhibit.can_share", self.get_object())

        if can_embed:
            context["exhibit_embed_url"] = get_site_url(reverse('exhibit_embed_js',
                                                    kwargs={
                                                        "owner": self.get_object().owner,
                                                        "slug": self.get_object().slug
                                                    }))
        return context


class ExhibitDetailView(ExhibitView):
    template_name = "exhibit/exhibit_detail.html"
    object_perm = "exhibit.can_inspect"

    def get_context_data(self, **kwargs):
        context = super(ExhibitDetailView, self).get_context_data(**kwargs)
        user = self.request.user
        can_embed = user.has_perm("exhibit.can_embed", self.get_object())
        context["can_embed"] = can_embed
        context["can_share"] = user.has_perm("exhibit.can_share", self.get_object())
        if can_embed:
            context["exhibit_embed_url"] = get_site_url(reverse('exhibit_embed_js',
                                                    kwargs={
                                                        "owner": self.get_object().owner,
                                                        "slug": self.get_object().slug
                                                    }))
        return context


class EmbeddedExhibitView(View):
    """Generate the javascript necessary to embed an exhibit on an external site
    """
    # The
    template_name = "exhibit/embed/show.js"

    # The template to display when an exhibit is not found
    not_found_template_name = "exhibit/embed/none.js"

    no_data_template_name = "exhibit/embed/no_dataset.js"

    def not_found_response(self, request, where):
        """Returns a trivial response when the desired exhibit is not found
        """
        response = render_to_response(self.not_found_template_name, {
            "where": where,
        }, context_instance=RequestContext(request))

        response['Content-Type'] = "application/javascript"
        return response

    def no_dataset_response(self, request, where):
        """Returns a trivial response when the desired dataset is not found
        """
        response = render_to_response(self.no_data_template_name, {
            "where": where,
        }, context_instance=RequestContext(request))

        response['Content-Type'] = "application/javascript"
        return response

    def get(self, request, owner, slug):
        where = request.GET.get('where', 'freemix-embed')
        try:
            exhibit = models.Exhibit.objects.get(slug=slug,
                                                 owner__username=owner,
                                                 published=True)
        except models.Exhibit.DoesNotExist:
            return self.not_found_response(request, where)

        if not exhibit.published:
            return self.not_found_response(request, where)

        if not exhibit.dataset_available(self.request.user):
            return self.no_dataset_response(request, where)
        
        metadata = exhibit.profile

        canvas = exhibit.canvas
        canvas_html = render_to_string(canvas.location, {}).replace("\n", " ")
        profile = exhibit.dataset
        data = profile.data

        response = render(request, self.template_name, {
            "data": json.dumps(data, use_decimal=True),
            "title": exhibit.title,
            "description": exhibit.description,
            "metadata": json.dumps(metadata),
            "data_profile": json.dumps(profile.profile),
            "where": where,
            "permalink": get_site_url(reverse("exhibit_display",
                                              kwargs={'owner': owner,
                                                      'slug': slug})),
            "canvas": canvas_html})
        response['Content-Type'] = "application/javascript"
        return response

# Exhibit Profile Views

class StockExhibitProfileJSONView(View):
    """Generate the default profile description of an exhibit for a particular dataset and canvas
    """
    def get(self, request, *args, **kwargs):
        owner = kwargs["owner"]
        slug = kwargs["slug"]

        ds = get_object_or_404(models.Dataset, owner__username=owner, slug=slug)
        user = self.request.user

        if not user.has_perm("dataset.can_view", ds):
            raise Http404

        return JSONResponse({
            "theme": conf.DEFAULT_EXHIBIT_THEME,
            "facets": {},
            "views": {
                "views": [{
                    "id": str(uuid.uuid4()),
                    "type": "list",
                    "name": "List"}]}})


class ExhibitProfileJSONView(View):

    def get(self, request, *args, **kwargs):
        owner = kwargs["owner"]
        slug = kwargs["slug"]

        exhibit = get_object_or_404(models.Exhibit, owner__username=owner, slug=slug)
        user = self.request.user

        if not user.has_perm("exhibit.can_view", exhibit):
            raise Http404

        return JSONResponse(exhibit.profile)


# List Views

class ExhibitListView(OwnerListView):
    template_name = "exhibit/list/exhibit_list_by_owner.html"

    permission = "exhibit.can_view"

    model = models.Exhibit


class ExhibitsByDatasetListView(ListView):
    template_name = "exhibit/list/exhibit_list_by_dataset.html"

    def get_dataset(self):
        slug = self.kwargs["slug"]
        owner = self.kwargs["owner"]
        return get_object_or_404(Dataset, slug=slug,owner__username=owner)

    def get_queryset(self):
        perm_filter = PermissionsRegistry.get_filter("exhibit.can_view", self.request.user)

        return models.Exhibit.objects.filter(dataset=self.get_dataset()).filter(perm_filter)

    def get_context_data(self, **kwargs):
        kwargs = super(ExhibitsByDatasetListView, self).get_context_data(**kwargs)

        kwargs["dataset"] = self.get_dataset()
        return kwargs


class CanvasListView(ListView):
    template_name="exhibit/canvas_list.html"

    def get_queryset(self):
        return models.Canvas.objects.filter(enabled=True)

    def get_context_data(self, **kwargs):
        kwargs = super(CanvasListView, self).get_context_data(**kwargs)
        kwargs["base_url"] = reverse("exhibit_create_editor",
                                     kwargs={"owner": self.kwargs["owner"],
                                             "slug": self.kwargs["slug"]})
        return kwargs

