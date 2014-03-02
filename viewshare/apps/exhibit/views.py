from django.core.serializers.json import DjangoJSONEncoder
import json

from django.utils.translation import ugettext_lazy as _
from django.http import (HttpResponse, Http404, HttpResponseRedirect,
                         HttpResponseForbidden, HttpResponseBadRequest)
from django.views.decorators.http import last_modified
from django.views.generic.base import View
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
from django.views.generic.detail import DetailView
from django.views.generic.edit import UpdateView
from django.views.generic.list import ListView
from django.db.models import Q
from viewshare.apps.augment.models import AugmentTransaction

from viewshare.apps.exhibit import models, forms, serializers
from viewshare.apps.exhibit.serializers import ExhibitPropertyListSerializer

# Exhibit Profile Views
from viewshare.utilities.views import (BaseJSONView,
                                       OwnerSlugPermissionMixin,
                                       OwnerListView)


def get_published_exhibit(request, owner, slug):
    if not hasattr(request, "exhibit"):
        request.exhibit = get_object_or_404(models.PublishedExhibit,
                                            slug=slug, owner__username=owner)
    return request.exhibit


def get_exhibit_modified(request, *args, **kwargs):
    return get_published_exhibit(request,
                                 kwargs["owner"],
                                 kwargs["slug"]).modified
exhibit_last_modified = last_modified(get_exhibit_modified)


class ExhibitDetailEditView(OwnerSlugPermissionMixin, UpdateView):
    form_class = forms.UpdateExhibitDetailForm
    object_perm = "exhibit.can_edit"
    model = models.PublishedExhibit
    template_name = "exhibit/edit/exhibit_metadata_form.html"

    def form_valid(self, form):
        self.object = form.save()

        return HttpResponseRedirect(reverse("exhibit_detail",
                                    kwargs={
                                        "owner": self.object.owner.username,
                                        "slug": self.object.slug
                                    }))


###############################################################################
# Display Views

class PublishedExhibitView(OwnerSlugPermissionMixin, DetailView):

    select_related = ("owner",)

    def get_queryset(self):
        rel = self.select_related
        return models.PublishedExhibit.objects.select_related(*rel)

    object_perm = "exhibit.can_view"
    template_name = "exhibit/exhibit_display.html"

    def get_context_data(self, **kwargs):
        context = super(PublishedExhibitView, self).get_context_data(**kwargs)
        user = self.request.user
        exhibit = self.get_object()

        context["exhibit"] = exhibit
        context["can_view"] = user.has_perm("exhibit.can_view", exhibit)
        context["can_inspect"] = user.has_perm("exhibit.can_inspect", exhibit)

        context["can_edit"] = user.has_perm("exhibit.can_edit", exhibit)
        context["can_delete"] = user.has_perm("exhibit.can_delete", exhibit)
        return context


class PublishedExhibitDisplayView(PublishedExhibitView):

    select_related = ("owner", )

    def delete(self, request, *args, **kwargs):
        exhibit = self.get_object()
        if request.user.has_perm("exhibit.can_delete", exhibit):
            exhibit.delete()
            return HttpResponse(_("%s deleted") % exhibit.get_absolute_url())
        return HttpResponseForbidden()

    def get_context_data(self, **kwargs):
        s = super(PublishedExhibitDisplayView, self)
        context = s.get_context_data(**kwargs)

        exhibit = self.get_object()

        user = self.request.user
        can_embed = user.has_perm("exhibit.can_embed", exhibit)
        context["can_embed"] = can_embed
        context["can_share"] = user.has_perm("exhibit.can_share", exhibit)

        if can_embed:
            url = reverse('exhibit_embed_js',
                          kwargs={
                              "owner": exhibit.owner,
                              "slug": exhibit.slug
                          })
            context["exhibit_embed_url"] = self.request.build_absolute_uri(url)
        return context


class PublishedExhibitJSONView(BaseJSONView):

    def get_doc(self):
        return None

    def get_parent_object(self):
        if not hasattr(self.request, "parent_object"):
            owner = self.kwargs["owner"]
            slug = self.kwargs["slug"]
            obj = get_object_or_404(models.PublishedExhibit,
                                    owner__username=owner,
                                    slug=slug)
            self.request.parent_object = obj
        return self.request.parent_object

    def check_perms(self):
        if not self.request.user.has_perm("exhibit.can_view",
                                          self.get_parent_object()):
            return False
        return True

    def cache_control_header(self):
        s = super(PublishedExhibitJSONView, self)
        cache_control = s.cache_control_header()
        if not self.get_parent_object().is_public:
            cache_control += ", private"
        else:
            cache_control += ", public"
        return cache_control


class PublishedExhibitDataView(PublishedExhibitJSONView):
    """
    Return a cached representation of all exhibit data and properties.

    TODO: Actually implement X-Accel-Redirect caching
    """
    def get_doc(self):
        return json.dumps(self.get_parent_object().merge_data(),
                          cls=DjangoJSONEncoder)


class PublishedExhibitDetailView(PublishedExhibitView):
    template_name = "exhibit/exhibit_detail.html"
    object_perm = "exhibit.can_inspect"

    def get_context_data(self, **kwargs):
        s = super(PublishedExhibitDetailView, self)
        ctx = s.get_context_data(**kwargs)
        user = self.request.user
        can_embed = user.has_perm("exhibit.can_embed", self.get_object())
        ctx["can_embed"] = can_embed
        ctx["can_share"] = user.has_perm("exhibit.can_share",
                                         self.get_object())
        if can_embed:
            url = reverse('exhibit_embed_js',
                          kwargs={"owner": self.get_object().owner.username,
                                  "slug": self.get_object().slug})
            url = self.request.build_absolute_uri(url)
            ctx["exhibit_embed_url"] = url
        return ctx


def get_public_exhibit(request, owner, slug):
    if not hasattr(request, "exhibit"):
        qs = models.PublishedExhibit.objects.select_related("owner")
        request.exhibit = get_object_or_404(qs,
                                            slug=slug,
                                            owner__username=owner,
                                            is_public=True)
    return request.exhibit


class EmbeddedExhibitView(View):
    """
    Generate the javascript necessary to embed an exhibit on an external site
    """
    template_name = "exhibit/embed/show.js"

    def get(self, request, owner, slug):
        where = request.GET.get('where', 'freemix-embed')
        exhibit = get_public_exhibit(request, owner, slug)

        metadata = exhibit.profile

        data = exhibit.merge_data()
        link_url = reverse("exhibit_display", kwargs={
            'owner': owner,
            'slug': slug
        })
        link_url = request.build_absolute_uri(link_url)
        response = render(request, self.template_name, {
            "data": json.dumps(data, cls=DjangoJSONEncoder),
            "title": exhibit.title,
            "description": exhibit.description,
            "metadata": json.dumps(metadata),
            "where": where,
            "permalink": link_url})
        response['Content-Type'] = "application/javascript"
        response['Cache-Control'] = "no-cache, must-revalidate, public"
        return response


embedded_exhibit_view = exhibit_last_modified(EmbeddedExhibitView.as_view())


class PublishedExhibitProfileJSONView(BaseJSONView):

    def get_parent_object(self):
        return get_published_exhibit(self.request,
                                     self.kwargs["owner"],
                                     self.kwargs["slug"])

    def get_doc(self):
        ex = self.get_parent_object()
        f = models.PublishedExhibit.objects.filter(id=ex.id)
        return f.values_list("profile", flat=True)[0]

    def check_perms(self):
        return self.request.user.has_perm("exhibit.can_view",
                                          self.get_parent_object())

    def cache_control_header(self):
        s = super(PublishedExhibitProfileJSONView, self)
        cache_control = s.cache_control_header()
        if not self.request.exhibit.is_public:
            cache_control += ", private"
        else:
            cache_control += ", public"
        return cache_control


exhibit_profile_json_view = PublishedExhibitProfileJSONView.as_view()
exhibit_profile_json_view = exhibit_last_modified(exhibit_profile_json_view)


# List Views

class PublishedExhibitListView(OwnerListView):
    template_name = "exhibit/list/exhibit_list_by_owner.html"

    permission = "exhibit.can_view"

    model = models.PublishedExhibit

    related = ("owner", "owner__profile")


# Draft Editor Views

class DraftExhibitView(View):

    def check_perms(self):
        return self.request.user.has_perm("exhibit.can_edit",
                                          self.get_parent_object())

    def get_parent_object(self):

        owner = self.kwargs["owner"]
        slug = self.kwargs["slug"]

        try:
            query = Q(owner__username=owner, slug=slug)
            self.exhibit = models.DraftExhibit.objects.get(query)
        except models.DraftExhibit.DoesNotExist:
            published = get_object_or_404(models.PublishedExhibit,
                                          owner__username=owner,
                                          slug=slug)
            self.exhibit = published.get_draft()
        return self.exhibit


class DraftExhibitPropertiesListView(DraftExhibitView, BaseJSONView):
    def get_doc(self):
        # Return ExhibitProperty models that have PropertyData
        qs = self.get_parent_object().properties\
                .filter(data__isnull=False).all()
        serializer = ExhibitPropertyListSerializer(self.get_parent_object(),
                                                   queryset=qs)
        return json.dumps({"properties": serializer.data})

    def post(self, request, *args, **kwargs):
        if not self.check_perms():
            raise Http404()
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest("Not a JSON document")
        exhibit = self.get_parent_object()
        serializer_class = serializers.get_serializer_type_by_dict(data)
        serializer = serializer_class(exhibit,
                                      data=data,
                                      draft=True)

        if not serializer.is_valid():
            return HttpResponseBadRequest("<br/>".join(serializer.errors))
        serializer.save()
        out = serializer_class(exhibit,
                               instance=serializer.instance,
                               draft=True)
        response = HttpResponse(json.dumps(out.data))
        response["Content-Type"] = "application/json"
        response["Expires"] = 0
        return response


class DraftExhibitPropertyJSONView(DraftExhibitView, BaseJSONView):
    def get_doc(self):
        # Return the JSON description of the desired property

        prop_name = self.kwargs["property"]
        exhibit = self.get_parent_object()

        prop = get_object_or_404(exhibit.properties.all(), name=prop_name)
        prop = prop.get_concrete()
        serializer_class = serializers.serializer_class_keys[prop.classname]
        serializer = serializer_class(exhibit, prop_name,
                                      instance=prop, draft=True)

        return json.dumps(serializer.data)

    def post(self, request, *args, **kwargs):
        if not self.check_perms():
            raise Http404()
        try:
            description = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest("Not a JSON document")
        exhibit = self.get_parent_object()
        prop_name = self.kwargs["property"]
        if not description:
            return HttpResponseBadRequest("No property description "
                                          "for %s" % prop_name)

        serializer_class = serializers.get_serializer_type_by_dict(description)
        serializer = serializer_class(exhibit, prop_name,
                                      data=description,
                                      draft=True)

        if not serializer.is_valid():
            return HttpResponseBadRequest("<br/>".join(serializer.errors))
        serializer.save()
        return HttpResponse("OK")

    def put(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        if not self.check_perms():
            raise Http404()
        prop_name = self.kwargs["property"]
        exhibit = self.get_parent_object()

        prop = get_object_or_404(exhibit.properties.all(), name=prop_name)
        prop.delete()
        return HttpResponse("OK")


class DraftExhibitPropertyDataView(DraftExhibitView, BaseJSONView):

    def get_query_args(self):
        return Q(exhibit_property__exhibit=self.get_parent_object(),
                 exhibit_property__name=self.kwargs["property"])

    def get_doc(self):
        q = self.get_query_args()
        values = models.PropertyData.objects.filter(q).values_list("json")
        if len(values) == 0:
            return None
        return '{"items": ' + values[0][0] + "}"

    def get(self, request, *args, **kwargs):
        """
        Return the JSON document representing the data for the property.

        In the event that there is no data, the following will be returned:
          * For a simple, unaugmentable property: `404`
          * For an augmentable property, an augmentation transaction will
            be created and a link to the status of the transaction will
            be returned in the `Location` header.  The status code of the
            response will be `202`, indicating ongoing processing.  The
            status link should be polled until a success or failure is
            indicated, at which point this URL will return the appropriate
            response.  In the event of an augmentation failure, this
            endpoint will return an empty Exhibit data document.
        """
        if not self.check_perms():
            raise Http404

        result = self.get_doc()
        tx = None
        if not result:
            prop = get_object_or_404(models.ExhibitProperty,
                                     exhibit=self.get_parent_object(),
                                     name=self.kwargs["property"])

            AugmentTransaction.objects.filter(property=prop).delete()
            tx = AugmentTransaction.objects.create(property=prop)

            status_url = reverse('draft_exhibit_property_status',
                                 kwargs={
                                     'owner': self.kwargs["owner"],
                                     'slug': self.kwargs["slug"],
                                     'property': self.kwargs["property"]
                                 })
            content = json.dumps({'augmentation_status': status_url})

            response = HttpResponse(content=content, status=202)
            response["Content-Type"]
            response["Location"] = status_url
        else:
            response = HttpResponse(result)

        response["Content-Type"] = "application/json"
        response["Expires"] = 0
        response["Cache-Control"] = self.cache_control_header()
        if tx is not None:
            tx.start_transaction()
        return response

    def delete(self, request, *args, **kwargs):
        if not self.check_perms():
            raise Http404()
        models.PropertyData.objects.filter(self.get_query_args()).delete()
        return HttpResponse("OK")


class DraftExhibitAllDataView(DraftExhibitView, BaseJSONView):
    """
    Return a cached representation of all exhibit data and properties.

    TODO: Actually implement X-Accel-Redirect caching
    """
    def get_doc(self):
        return json.dumps(self.get_parent_object().merge_data(),
                          cls=DjangoJSONEncoder)


class DraftExhibitPropertyDataStatusView(DraftExhibitView):
    """
    Status endpoint for a running data augmentation
    """
    def get(self, request, *args, **kwargs):
        """
        Checks for an open transaction for the desired property.
            * If the transaction is complete, a document describing success
              or failure will be returned with a status of `201 Created`.
              The URL to retrieve the final document will be provided in the
              Location header
            * If the transaction is still running, an empty response will
              be returned with a `200` status


        """
        lookup = {
            "property__name":self.kwargs["property"],
            "property__exhibit": self.get_parent_object()
        }
        transaction = get_object_or_404(AugmentTransaction, **lookup)

        still_running_statuses = (models.TX_STATUS["pending"],
                                  models.TX_STATUS["scheduled"],
                                  models.TX_STATUS["running"])
        if transaction.status == models.TX_STATUS["success"]:
            body = json.dumps(transaction.result)
            response = HttpResponse(body, status=201)
            data_url = reverse('draft_exhibit_property_data',
                               kwargs={
                               'owner': self.kwargs["owner"],
                               'slug': self.kwargs["slug"],
                               'property': self.kwargs["property"]
                               })
            response["Location"] = data_url
            response["Content-Type"] = "application/json"
            response["Expires"] = 0
        elif transaction.status in still_running_statuses:
            response = HttpResponse("{}")
            response["Content-Type"] = "application/json"
        else:
            # transction has failed or been cancelled
            body = json.dumps(transaction.result)
            response = HttpResponse(body)
            response["Content-Type"] = "application/json"
        return response


class DraftExhibitProfileJSONView(DraftExhibitView, BaseJSONView):

    def get_doc(self):
        ex = self.get_parent_object()
        draft = models.DraftExhibit.objects.filter(id=ex.id)
        return draft.values_list("profile", flat=True)[0]

    def post(self, request, *args, **kwargs):
        exhibit = self.get_parent_object()

        if not self.check_perms():
            raise Http404()

        contents = json.loads(self.request.body)
        exhibit.update_from_profile(contents)
        return HttpResponse()


class DraftExhibitUpdateView(DraftExhibitView):
    template_name = "exhibit/exhibit_update.html"

    def get(self, request, *args, **kwargs):
        exhibit = self.get_parent_object()

        params = {
            "owner": self.kwargs["owner"],
            "slug": self.kwargs["slug"]
        }

        profile_url = reverse("draft_exhibit_profile_json",
                              kwargs=params)
        properties_url = reverse('draft_exhibit_property_list',
                                 kwargs=params)

        data_urls = exhibit.properties.get_data_urls()

        if not self.check_perms():
            raise Http404()

        context = {
            "exhibit_profile_url": profile_url,
            "dataset_properties": properties_url,
            "data_urls": data_urls,
            "owner": request.user.username,
            "exhibit": exhibit
        }

        user = self.request.user
        exhibit = exhibit

        context["can_view"] = user.has_perm("exhibit.can_view", exhibit)
        context["can_inspect"] = user.has_perm("exhibit.can_inspect", exhibit)

        context["can_edit"] = user.has_perm("exhibit.can_edit", exhibit)
        context["can_delete"] = user.has_perm("exhibit.can_delete", exhibit)
        return render(request, self.template_name, context)

    def delete(self, request, *args, **kwargs):
        exhibit = self.get_parent_object()

        if not self.check_perms():
            raise Http404()
        if models.Exhibit.objects.filter(is_draft=False,
                                         owner=exhibit.owner,
                                         slug=exhibit.slug):
            url = reverse("exhibit_display", kwargs={
                "owner": exhibit.owner.username,
                "slug": exhibit.slug
            })
        else:
            url = reverse("upload_dataset")
        exhibit.delete()

        return HttpResponse("<a href='%s'></a>" % url)


class PublishExhibitView(DraftExhibitView):

    form_class = forms.CreateExhibitForm
    template_name = "exhibit/create/exhibit_metadata_form.html"

    def post(self, request, *args, **kwargs):
        if not self.check_perms():
            raise Http404()

        if "application/json" in request.META["CONTENT_TYPE"]:
            return self.update_profile(request)
        else:
            return self.publish_form(request)

    def publish_form(self, request):
        draft = self.get_parent_object()

        form = self.form_class(request.POST, draft=draft)

        if form.is_valid():
            form.save()
            return self.success(request, form.instance)

        else:
            return render(request, self.template_name, {
                "form": form,
                "draft": draft
            })

    def update_profile(self, request):
        draft = self.get_parent_object()

        contents = json.loads(self.request.body)
        draft.update_from_profile(contents)

        if draft.parent:
            draft.publish()
            return self.success(request, draft.parent)
        form = forms.CreateExhibitForm(draft=draft)

        return render(request, self.template_name, {
            "form": form,
            "draft": draft
        })

    def success(self, request, instance):
        response_url = reverse('exhibit_display',
                               kwargs={
                                   "owner": instance.owner.username,
                                   "slug": instance.slug
                               })
        return HttpResponse("<a rev='%s'></a>" % response_url)


class PropertyEditorView(DraftExhibitView):
    """
    TODO: Remove this! Displaying the property editor should be handled
    in freemix/templates/exhibit/edit/base.html template. I've created
    this separate View and template as a proof of concept. It was easier
    to create a separate view and make sure everything in the property editor
    is working with the DraftExhibit API on it's own before integrating it
    with the new builder code.
    To remove:
        * this view
        * the property_editor url
        * freemix/templates/exhibit/edit/property-editor.html
    """

    template_name="exhibit/edit/property-editor.html"

    def get(self, request, *args, **kwargs):
        exhibit = self.get_parent_object()

        params = {
            "owner": self.kwargs["owner"],
            "slug": self.kwargs["slug"]
        }

        profile_url = reverse("draft_exhibit_profile_json",
                              kwargs=params)
        properties_url = reverse('draft_exhibit_property_list',
                                 kwargs=params)

        data_urls = exhibit.properties.get_data_urls()
        context = {
            "exhibit_profile_url": profile_url,
            "dataset_properties": properties_url,
            "cancel_url": self.exhibit.get_absolute_url(),
            "data_urls": data_urls,
            "owner": request.user.username,
            "exhibit": exhibit
        }

        user = self.request.user
        exhibit = exhibit

        context["can_view"] = user.has_perm("exhibit.can_view", exhibit)
        context["can_inspect"] = user.has_perm("exhibit.can_inspect", exhibit)

        context["can_edit"] = user.has_perm("exhibit.can_edit", exhibit)
        context["can_delete"] = user.has_perm("exhibit.can_delete", exhibit)
        return render(request, self.template_name, context)
