from django.views.generic.base import View

from viewshare.apps.augment import models
from viewshare.utilities.views import JSONResponse


class JSONView(View):

    template = None

    def get_dict(self, *args, **kwargs):
        return {}

    def get(self, *args, **kwargs):
        content = self.get_dict(*args, **kwargs)
        return JSONResponse(content, self.template)


class ListPatternJSONView(JSONView):
    def get_dict(self, *args, **kwargs):
        return models.ListPattern.to_dict()


pattern_jsonp = ListPatternJSONView.as_view(template="dataset/augment"
                                                     "/patterns.js")
pattern_json = ListPatternJSONView.as_view()


class AugmentationErrorJSONView(JSONView):
    def get_dict(self, *args, **kwargs):
        return models.AugmentationErrorCode.to_dict()


error_json = AugmentationErrorJSONView.as_view()
