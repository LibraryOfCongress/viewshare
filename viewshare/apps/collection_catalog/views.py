import json
from django.shortcuts import get_object_or_404
from viewshare.utilities.views import BaseJSONView


class CatalogListJSONView(BaseJSONView):
    """
    Returns an Exhibit JSON document representing all objects for the
    supplied model
    """
    model = None

    def get_doc(self):
        return json.dumps({"items": [x.to_dict()
                                     for x in self.model.objects.all()]})


class CatalogItemJSONView(BaseJSONView):
    """
    Returns a JSON representation of a particular instance of the supplied
    model based on it's slug
    """
    model = None

    def get_doc(self):
        obj = get_object_or_404(self.model, slug=self.kwargs["slug"])
        return json.dumps(obj.to_dict())
