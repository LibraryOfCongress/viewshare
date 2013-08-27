import json
import uuid

from django.utils.translation import ugettext_lazy as _
from django.http import *
from django.views.decorators.http import last_modified
from django.views.generic.base import View
from django.shortcuts import  get_object_or_404, render
from django.template.loader import render_to_string
from django.core.urlresolvers import  reverse
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.list import ListView

from freemix.exhibit import models, forms, conf
from viewshare.apps.legacy.dataset.models import Dataset
from freemix.exhibit.models import Canvas
from freemix.exhibit.serializers import ExhibitPropertyListSerializer
from freemix.permissions import PermissionsRegistry
from freemix.utils import get_site_url
from freemix.views import JSONResponse, OwnerListView, OwnerSlugPermissionMixin, BaseJSONView


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
    model = models.PublishedExhibit
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

        self.dataset = get_object_or_404(Dataset.objects.select_related("owner"),
                                         owner__username=self.kwargs["owner"],
                                         slug=self.kwargs["slug"])

        if not self.check_permissions():
            raise Http404()

        profile_url = reverse("exhibit_profile_template", kwargs=self.dataset_args)
        dataset_profile_url = reverse("dataset_profile_json", kwargs=self.dataset_args)
        data_url = reverse("dataset_data_json", kwargs=self.dataset_args)
        dataset_properties_cache = reverse("dataset_properties_cache_json", kwargs=self.dataset_args)

        canvas_slug = self.request.GET.get("canvas", conf.DEFAULT_EXHIBIT_CANVAS)
        canvas = get_object_or_404(models.Canvas, slug=canvas_slug)

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
        qs = models.Exhibit.objects.select_related("dataset",
                                                   "dataset__owner",
                                                   "owner")

        self.exhibit = get_object_or_404(qs,
                                         owner__username=self.kwargs["owner"],
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

    select_related = ("owner",)

    def get_queryset(self):
        return models.PublishedExhibit.objects.select_related(*self.select_related)

    object_perm = "exhibit.can_view"
    template_name = "exhibit/exhibit_display.html"

    def get_context_data(self, **kwargs):
        context = super(ExhibitView, self).get_context_data(**kwargs)
        user = self.request.user
        exhibit = self.get_object()

        context["exhibit"] = exhibit
        context["can_view"] = user.has_perm("exhibit.can_view", exhibit)
        context["can_inspect"] = user.has_perm("exhibit.can_inspect", exhibit)

        context["can_edit"] = user.has_perm("exhibit.can_edit", exhibit)
        context["can_delete"] = user.has_perm("exhibit.can_delete", exhibit)
        return context

class ExhibitDisplayView(ExhibitView):

    select_related = ("owner", "canvas")


    def delete(self, request, *args, **kwargs):
        exhibit = self.get_object()
        if request.user.has_perm("exhibit.can_delete", exhibit):
            exhibit.delete()
            return HttpResponse(_("%s deleted") % exhibit.get_absolute_url())
        return HttpResponseForbidden()

    def get_context_data(self, **kwargs):

        context = super(ExhibitDisplayView, self).get_context_data(**kwargs)

        exhibit = self.get_object()

        user = self.request.user
        can_embed = user.has_perm("exhibit.can_embed", exhibit)
        context["can_embed"] = can_embed
        context["can_share"] = user.has_perm("exhibit.can_share", exhibit)

        context["property_data_urls"] = exhibit.properties.get_data_urls()

        if can_embed:
            url = reverse('exhibit_embed_js',
                            kwargs={
                                "owner": exhibit.owner,
                                "slug": exhibit.slug
                            })
            context["exhibit_embed_url"] = get_site_url(url)
        return context


class ExhibitJSONView(BaseJSONView):

    def get_doc(self):
        return None

    def get_parent_object(self):
        if not hasattr(self.request, "parent_object"):
            owner = self.kwargs["owner"]
            slug = self.kwargs["slug"]
            self.request.parent_object = get_object_or_404(models.PublishedExhibit, owner__username=owner, slug=slug)
        return self.request.parent_object

    def check_perms(self):
        if not self.request.user.has_perm("exhibit.can_view", self.get_parent_object()):
            return False
        return True

    def cache_control_header(self):
        cache_control = super(ExhibitJSONView, self).cache_control_header()
        if not self.get_parent_object().is_public:
            cache_control += ", private"
        else:
            cache_control += ", public"
        return cache_control


class PublishedExhibitPropertiesListView(ExhibitJSONView):
    def get_doc(self):
        qs = self.get_parent_object().properties.all()
        serializer = ExhibitPropertyListSerializer(self.get_parent_object,
                                                   queryset=qs)
        return json.dumps(serializer.data)


class PublishedExhibitPropertyDataView(ExhibitJSONView):
    def get_doc(self):
        values = models.PropertyData.objects.filter(exhibit_property__exhibit=self.get_parent_object(), exhibit_property__name=self.kwargs["property"]).values_list("json")
        if len(values) == 0:
            return '{"items": []}'
        return '{"items": ' + values[0][0] + "}"


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


def get_public_exhibit(request, owner, slug):
    if not hasattr(request, "exhibit"):
        qs = models.PublishedExhibit.objects.select_related("owner")
        request.exhibit = get_object_or_404(qs, slug=slug, owner__username=owner, is_public=True)
    return request.exhibit


class EmbeddedExhibitView(View):
    """Generate the javascript necessary to embed an exhibit on an external site
    """
    # The
    template_name = "exhibit/embed/show.js"

    def get(self, request, owner, slug):
        where = request.GET.get('where', 'freemix-embed')
        exhibit = get_public_exhibit(request, owner, slug)

        metadata = exhibit.profile

        canvas = exhibit.canvas
        canvas_html = render_to_string(canvas.location, {}).replace("\n", " ")
        dataset = exhibit.dataset

        data_dict = Dataset.objects.filter(id=dataset.id).values("data__data",
            "profile__data",
            "properties_cache__data")[0]

        response = render(request, self.template_name, {
            "data": data_dict["data__data"],
            "title": exhibit.title,
            "description": exhibit.description,
            "metadata": json.dumps(metadata),
            "data_profile": data_dict["profile__data"],
            "properties": data_dict["properties_cache__data"],
            "where": where,
            "permalink": get_site_url(reverse("exhibit_display",
                                              kwargs={'owner': owner,
                                                      'slug': slug})),
            "canvas": canvas_html})
        response['Content-Type'] = "application/javascript"
        response['Cache-Control'] = "no-cache, must-revalidate, public"
        return response

def lmfunc(r, owner, slug):
    ex = get_public_exhibit(r, owner, slug)
    if ex.modified > ex.dataset.modified:
        return ex.modified
    return ex.dataset.modified
embedded_exhibit_view = last_modified(lmfunc)(EmbeddedExhibitView.as_view())

# Exhibit Profile Views

class StockExhibitProfileJSONView(View):
    """Generate the default profile description of an exhibit for a particular dataset and canvas
    """
    def get(self, request, *args, **kwargs):

        return JSONResponse({
            "facets": {},
            "views": {
                "views": [{
                    "id": str(uuid.uuid4()),
                    "type": "list",
                    "name": "List"
                }]
            },
            "lenses": []
        })



def get_exhibit(request, owner, slug):
    if not hasattr(request, "exhibit"):
        request.exhibit = get_object_or_404(models.PublishedExhibit, slug=slug, owner__username=owner)
    return request.exhibit

class ExhibitProfileJSONView(BaseJSONView):

    def get_parent_object(self):
        return get_exhibit(self.request, self.kwargs["owner"], self.kwargs["slug"])

    def get_doc(self):
        ex = self.get_parent_object()
        return models.PublishedExhibit.objects.filter(id=ex.id).values_list("profile", flat=True)[0]

    def check_perms(self):
        return self.request.user.has_perm("exhibit.can_view", self.get_parent_object())


    def cache_control_header(self):
        cache_control = super(ExhibitProfileJSONView, self).cache_control_header()
        if not self.request.exhibit.is_public:
            cache_control += ", private"
        else:
            cache_control += ", public"
        return cache_control
lmdec = last_modified(lambda request, *args, **kwargs: get_exhibit(request, kwargs["owner"], kwargs["slug"]).modified)
exhibit_profile_json_view = lmdec(ExhibitProfileJSONView.as_view())

# List Views

class ExhibitListView(OwnerListView):
    template_name = "exhibit/list/exhibit_list_by_owner.html"

    permission = "exhibit.can_view"

    model = models.PublishedExhibit

    related = ("owner", "owner__profile")


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

