from cms.middleware.toolbar import ToolbarMiddleware
from cms.views import details

_original_show_toolbar = None

def _patched_show_toolbar(self, request, response):
    return _original_show_toolbar(self, request, response) and \
           getattr(request, 'view_func', None) == details

class CMSToolbarPatchMiddleware(object):
    """
    Patch the django-cms ToolbarMiddleware so the toolbar is only shown when
    the passed in view function is cms.views.details.
    """
    def process_request(self, request):

        global _original_show_toolbar
        if not _original_show_toolbar:
            _original_show_toolbar = ToolbarMiddleware.show_toolbar
            ToolbarMiddleware.show_toolbar = _patched_show_toolbar

