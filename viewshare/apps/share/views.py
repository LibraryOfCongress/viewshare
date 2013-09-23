import json

from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseForbidden, Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.decorators.http import last_modified
from django.views.generic.detail import DetailView
from django.utils.translation import ugettext_lazy as _
from django.views.generic.edit import CreateView

from viewshare.apps.share import models
from viewshare.apps.exhibit.models import PublishedExhibit, PropertyData
from viewshare.apps.exhibit.serializers import ExhibitPropertyListSerializer
from viewshare.apps.share import forms


# The last_modified decorator requires a function
from viewshare.utilities.views import BaseJSONView


def _exhibit_modified(r, *a, **kwa):
    qs = models.SharedExhibitKey.objects.filter(slug=kwa["slug"])
    qs = qs.values_list("exhibit__modified", flat=True)[0]
    return qs
_lm = last_modified(_exhibit_modified)

class SharedExhibitDisplayView(DetailView):

    model = models.SharedExhibitKey

    template_name = "share/exhibit_display.html"

    def get_object(self, queryset=None):
        if queryset is None:
            queryset = self.get_queryset()
        queryset = queryset.select_related("exhibit__theme",
                                           "exhibit__canvas",
                                           "exhibit__owner")
        obj = get_object_or_404(queryset, slug=self.kwargs.get("slug"))
        return obj

    def delete(self, request, *args, **kwargs):
        key = self.get_object()
        exhibit = key.exhibit
        if request.user.has_perm("exhibit.can_share", exhibit):
            key.delete()
            return HttpResponse(_("%s deleted") % key.get_absolute_url())
        return HttpResponseForbidden()

    def get_context_data(self, **kwargs):
        context = super(SharedExhibitDisplayView, self).get_context_data(**kwargs)
        key = self.object
        exhibit = key.exhibit
        props = exhibit.properties.exclude(data=None)

        def data_url(prop_name):
            return reverse('shared_key_property_data_json',
                        kwargs={
                            "slug": key.slug,
                            "property": prop_name
                        })

        context["data_urls"] = [data_url(p.name) for p in props]
        context["exhibit"] = key.exhibit
        context["object"] = key
        context["can_view"] = True
        return context


#-----------------------------------------------------------------------------#
# Shared data profile json

def get_shared_key(request, *args, **kwargs):
    """
    Shared key retrieval function for use by the last_modified decorator
    """
    if not hasattr(request, "shared_key"):
        slug = kwargs["slug"]
        qs = models.SharedExhibitKey.objects.select_related("exhibit__owner")
        request.shared_key = get_object_or_404(qs, slug=slug)
    return request.shared_key


class SharedKeyDataJSONView(BaseJSONView):
    def get_doc(self):
        prop_name = self.kwargs["property"]
        key = get_shared_key(self.request, self.args, **self.kwargs)
        exhibit = key.exhibit
        qs = PropertyData.objects.filter(exhibit_property__exhibit=exhibit,
                                         exhibit_property__name=prop_name)
        values = qs.values_list("json")
        if len(values) == 0:
            return '{"items": []}'
        return '{"items": ' + values[0][0] + "}"
shared_key_property_data_json = _lm(SharedKeyDataJSONView.as_view())

class SharedExhibitPropertyListJSONView(BaseJSONView):
    def get_doc(self):
        key = get_shared_key(self.request, self.args, **self.kwargs)
        exhibit = key.exhibit
        qs = exhibit.properties.all()
        serializer = ExhibitPropertyListSerializer(exhibit,
                                                   queryset=qs)
        return json.dumps({"properties": serializer.data})
shared_dataset_properties_list_json = _lm(SharedExhibitPropertyListJSONView.as_view())


#-----------------------------------------------------------------------------#
# Shared exhibit profile json

class SharedExhibitProfileJSONView(BaseJSONView):
    """
    Returns the exhibit profile associated with a particular shared key.

    There is no permissions check, as the owner of the key is the owner
    of the exhibit.
    """
    def get_doc(self):
        slug = self.kwargs["slug"]
        qs =  models.SharedExhibitKey.objects.filter(slug=slug)
        qs = qs.values_list("exhibit__profile", flat=True)
        if not len(qs):
            raise Http404
        return qs[0]


shared_exhibit_profile_view = _lm(SharedExhibitProfileJSONView.as_view())

#-----------------------------------------------------------------------------#

class SharedKeyCreateFormView(CreateView):
    form_class = forms.CreateSharedExhibitKeyForm
    template_name = "share/shared_key_form.html"
    def get_success_url(self):
        return reverse('shared_key_create_success',
                       kwargs={"slug": self.object.slug})

    def get_form_kwargs(self):
        kwargs = super(SharedKeyCreateFormView, self).get_form_kwargs()
        exhibit = get_object_or_404(PublishedExhibit,
                                    slug=self.kwargs["slug"],
                                    owner__username=self.kwargs["owner"])
        kwargs["exhibit"] = exhibit

        return kwargs

    def form_valid(self, form):
        if not self.request.user.has_perm("exhibit.can_share", form.exhibit):
            return HttpResponseForbidden()
        self.object = form.save()
        return HttpResponseRedirect(self.get_success_url())
