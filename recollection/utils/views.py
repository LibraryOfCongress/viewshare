from django.http import HttpResponseServerError
from django.template import loader, RequestContext

def server_error(request, template_name='500.html'):
    """
    500 error handler.

    Templates: `500.html`
    Context: None
    """
    t = loader.get_template(template_name)
    return HttpResponseServerError(t.render(RequestContext(request)))
