from django import forms
from django.conf import settings
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, Submit
from django.contrib.localflavor.us.us_states import US_STATES
from registration.forms import RegistrationForm
from django.utils.translation import ugettext_lazy as _
from django.utils import simplejson as json
from viewshare.apps.moderated_registration import models

_invalid_username_ = _("This value must contain only letters, "
                     "numbers and underscores.")

_state_list_ = (('', 'Non-US'),) + US_STATES


class ViewShareRegistrationForm(RegistrationForm):

    username = forms.RegexField(
        regex=r'^[\w.-]+$',
        max_length=30,
        widget=forms.TextInput(attrs={'class': 'required'}),
        label=_("Username"),
        error_messages={'invalid': _invalid_username_})

    organization = forms.CharField(
        required=True,
        max_length=100,
        label=_("Name"))

    org_type = forms.CharField(
        label=_("Type of Organization"),
        max_length=100,
        required=True)

    org_state = forms.ChoiceField(
        label=_("Organization State"),
        choices=_state_list_,
        required=False)

    reason = forms.CharField(
        label=_(" "),
        required=True,
        widget=forms.Textarea)

    def __init__(self, *args, **kwargs):
        super(ViewShareRegistrationForm, self).__init__(*args, **kwargs)
        org_types = models.OrganizationType.objects.all().order_by("value")

        self.org_type_choices = json.dumps([b.value for b in org_types])
#        self.fields["username"].regex = r"^[\w.-_]+$"

        self.helper = FormHelper()
        self.helper.layout = Layout(
                Fieldset("User Information",
                    "username",
                    "email",
                    "password1",
                    "password2",
                    css_class="inlineLabels"),

                Fieldset("Describe your Organization",
                    "organization",
                    "org_type",
                    "org_state",
                    css_class="inlineLabels"),

                Fieldset("How do you plan to use %s?" % settings.SITE_NAME,
                    "reason",
                    css_class="inlineLabels")
            )
        self.helper.add_input(Submit('add', "Sign Up"))
