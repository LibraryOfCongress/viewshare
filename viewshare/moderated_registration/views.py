from django.views.generic.base import TemplateView


def registration_view(template):
    return TemplateView.as_view(template_name='registration/%s' % template)

activation_complete = registration_view('activation_complete.html')

registration_complete = registration_view('registration_complete.html')

registration_closed = registration_view('registration_closed.html')
