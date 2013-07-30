import logging
from django.conf import settings
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404, render
from django.template import loader, RequestContext
from django.views.generic import View

from viewshare.apps.legacy.dataset.models import parse_profile_json, DataSource
from viewshare.apps.support.backends import get_support_backend

from viewshare.utilities.views import get_akara_version
from viewshare.apps.upload.transform import AKARA_URL_PREFIX
from freemix import __version__ as freemix_version
from freemix.utils import get_user, get_site_url

from viewshare import __version__ as viewshare_version
from viewshare.apps.support import forms

logger = logging.getLogger(__name__)


class SupportFormView(View):
    """
    A generic view for generating a support issue based on submitted form
    contents

        `template`: the presentation of the issue form
        `issue_template`: used to generate the description for the new issue
        `form_class`: a subclass of `forms.SupportIssueForm`
    """

    create_template = "support/create_issue.html"
    issue_template = "support/description.html"
    response_template = "support/issue_response.html"
    tracker = "default"

    form_class = forms.SupportIssueForm

    def get(self, request, *args, **kwargs):
        initial = {}
        if request.user.email:
            initial["contact_email"] = self.request.user.email
            initial["contact_type"] = "email"
        form = self.form_class(initial=initial)
        return render(request, self.create_template, {'form': form})

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST)
        if form.is_valid():
            return self.create_issue(request, form, *args, **kwargs)
        return render(request, self.create_template, {'form': form})

    def generate_context(self, request, form, *args, **kwargs):
        username = request.user.username
        profile = reverse('profile_detail', kwargs={'username': username})
        profile = get_site_url(profile)
        system_name = '%s %s' % (settings.SITE_NAME,
                                 settings.SITE_NAME_STATUS)

        info = (settings.SITE_NAME,
                viewshare_version,
                freemix_version,
                get_akara_version(),
                AKARA_URL_PREFIX,)
        system_info = '%s %s - Freemix %s - Akara %s - Akara Root %s' % info

        return dict(form.cleaned_data, **{
            'submitting_user_name': request.user.username,
            'submitting_user_profile': profile,
            'system_name': system_name,
            'system_link': get_site_url(),
            'system_info': system_info,
            'user_agent': request.META["HTTP_USER_AGENT"]
        })

    def issue_subject(self, context):
        return "New Issue"

    def create_issue(self, request, form, *args, **kwargs):
        t = loader.get_template(self.issue_template)
        c = self.generate_context(request, form, *args, **kwargs)
        c = RequestContext(request, c)

        subject = self.issue_subject(c)
        description = t.render(c)

        backend = get_support_backend()
        context = backend.create_issue(request,
                                       subject,
                                       description,
                                       self.tracker)

        return backend.render_issue_response(request, context)


class AugmentationIssueView(SupportFormView):
    create_template = "support/create_augmentation_issue.html"
    issue_template = "support/augmentation_description.html"
    form_class = forms.AugmentationIssueForm
    tracker = "augmentation"

    def issue_subject(self, context):
        return "%s requests augmentation diagnosis for %s" % (
            context.get("submitting_user_name"),
            context.get("dataset")
        )

    def generate_context(self, request, form, *args, **kwargs):
        support = get_user(settings.SUPPORT_USER)

        profile_json = form.cleaned_data.get("profile_json")

        profile = parse_profile_json(support, profile_json)

        c = super(AugmentationIssueView, self).generate_context(request, form)
        return dict(c, **{"dataset": get_site_url(profile.get_absolute_url())})


class DataLoadIssueView(SupportFormView):

    def generate_context(self, request, form, *args, **kwargs):
        source_id = kwargs["source_id"]
        source = get_object_or_404(DataSource, uuid=source_id)

        c = super(DataLoadIssueView, self).generate_context(request, form)
        return dict(c, **{"source": source})


class DataLoadIgnoredFieldsIssueView(DataLoadIssueView):

    create_template = "support/ignored_field_issue.html"
    issue_template = "support/ignored_field_description.html"
    tracker = "ignored_field"

    def issue_subject(self, context):
        username = context.get("submitting_user_name")
        return "%s requests data transformation support" % username


class DataLoadUploadIssueView(DataLoadIssueView):

    create_template = "support/upload_issue.html"
    issue_template = "support/upload_description.html"
    tracker = "upload"

    def issue_subject(self, context):
        username = context.get("submitting_user_name")
        return "%s requests data upload support" % username
