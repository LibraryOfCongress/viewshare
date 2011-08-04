import json
from django.http import HttpResponse, HttpResponseForbidden, Http404
from django.shortcuts import get_object_or_404
from django.views.generic.base import View
from django.views.generic.detail import DetailView
from django.utils.translation import ugettext_lazy as _
from freemix.views import JSONResponse
from recollection.share import models

class SharedExhibitDisplayView(DetailView):

    model = models.SharedExhibitKey

    template_name = "share/exhibit_display.html"

    def get_object(self, queryset=None):
        if queryset is None:
            queryset = self.get_queryset()
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
        exhibit = self.get_object().exhibit
        context["exhibit"] = exhibit
        context["can_view"] = True
        context["dataset_available"] = exhibit.dataset_available(exhibit.owner)
        return context


class SharedKeyJSONView(View):

    def get_json(self):
        return {}

    def get(self, request, *args, **kwargs):
        slug = kwargs["slug"]
        self.key = get_object_or_404(models.SharedExhibitKey, slug=slug)
        self.exhibit = self.key.exhibit
        if not self.exhibit.dataset_available(self.exhibit.owner):
            raise Http404
        return JSONResponse(self.get_json())


class SharedDatasetDataJSONView(SharedKeyJSONView):
    def get_json(self):
        return self.exhibit.dataset.data


class SharedDatasetProfileJSONView(SharedKeyJSONView):
    def get_json(self):
        return self.exhibit.dataset.profile


class SharedExhibitProfileJSONView(SharedKeyJSONView):
    def get_json(self):
        return self.exhibit.profile
