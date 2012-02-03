from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseForbidden, Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.decorators.http import last_modified
from django.views.generic.detail import DetailView
from django.utils.translation import ugettext_lazy as _
from django.views.generic.edit import CreateView
from freemix.dataset import models as dataset_models
from freemix.exhibit.models import Exhibit
from freemix.views import BaseJSONView
from freemix.exhibit.share import models, forms

class SharedExhibitDisplayView(DetailView):

    model = models.SharedExhibitKey

    template_name = "share/exhibit_display.html"

    def get_object(self, queryset=None):
        if queryset is None:
            queryset = self.get_queryset()
        queryset = queryset.select_related("exhibit__dataset",
                                           "exhibit__theme",
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

        context["exhibit"] = key.exhibit
        context["object"] = key
        context["can_view"] = True
        context["dataset_available"] = key.exhibit.dataset_available(key.exhibit.owner)
        return context


#-----------------------------------------------------------------------------#
# Shared data profile json

def get_shared_key(request, *args, **kwargs):
    """
    Shared key retrieval function for use by the last_modified decorator
    """
    if not hasattr(request, "shared_key"):
        slug = kwargs["slug"]
        qs = models.SharedExhibitKey.objects.select_related("exhibit__owner","dataset")
        request.shared_key = get_object_or_404(qs, slug=slug)
    return request.shared_key


class SharedKeyDatasetJSONView(BaseJSONView):
    model = None

    def get_parent_object(self):
        return get_shared_key(self.request, *self.args, **self.kwargs)

    def get_doc(self):
        key = self.get_parent_object()
        qs = self.model.objects.filter(dataset=key.exhibit.dataset)
        return qs.values_list("data", flat=True)[0]

    def check_perms(self):
        key = self.get_parent_object()
        return key.exhibit.dataset_available(key.exhibit.owner)

def _dataset_modified(r, *a, **kwa):
    key = get_shared_key(r, *a, **kwa)
    return key.exhibit.dataset.modified
_lm = last_modified(_dataset_modified)

shared_dataset_profile_json = _lm(SharedKeyDatasetJSONView.as_view(model=dataset_models.DatasetProfile))
shared_dataset_data_json = _lm(SharedKeyDatasetJSONView.as_view(model=dataset_models.DatasetJSONFile))
shared_dataset_properties_json = _lm(SharedKeyDatasetJSONView.as_view(model=dataset_models.DatasetPropertiesCache))


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

# The last_modified decorator requires a function
def _exhibit_modified(r, *a, **kwa):
    qs = models.SharedExhibitKey.objects.filter(slug=kwa["slug"])
    qs = qs.values_list("exhibit__modified", flat=True)[0]
    return qs
lm = last_modified(_exhibit_modified)
shared_exhibit_profile_view = lm(SharedExhibitProfileJSONView.as_view())

#-----------------------------------------------------------------------------#

class SharedKeyCreateFormView(CreateView):
    form_class = forms.CreateSharedExhibitKeyForm
    template_name = "share/shared_key_form.html"
    def get_success_url(self):
        return reverse('shared_key_create_success',
                       kwargs={"slug": self.object.slug})

    def get_form_kwargs(self):
        kwargs = super(SharedKeyCreateFormView, self).get_form_kwargs()
        exhibit = get_object_or_404(Exhibit,
                                    slug=self.kwargs["slug"],
                                    owner__username=self.kwargs["owner"])
        kwargs["exhibit"] = exhibit

        return kwargs

    def form_valid(self, form):
        if not self.request.user.has_perm("exhibit.can_share", form.exhibit):
            return HttpResponseForbidden()
        self.object = form.save()
        return HttpResponseRedirect(self.get_success_url())
        