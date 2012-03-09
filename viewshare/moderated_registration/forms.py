from django import forms
from uni_form.helpers import FormHelper, Layout, Fieldset, Submit
from django.contrib.localflavor.us.us_states import US_STATES
from registration.forms import RegistrationForm
from viewshare.moderated_registration import models
from django.utils.translation import ugettext_lazy as _
from django.utils import simplejson as json

class ViewShareRegistrationForm(RegistrationForm):

    username = forms.RegexField(regex=r'^[\w.-]+$',
                                max_length=30,
                                widget=forms.TextInput(attrs={'class': 'required'}),
                                label=_("Username"),
                                error_messages={'invalid': _("This value must contain only letters, numbers and underscores.")})

    organization = forms.CharField(required=True, max_length=100, label=_("Name"))

    org_type = forms.CharField(label="Type of Organization", max_length=100, required=True)

    org_state = forms.ChoiceField(label=_("Organization State"), choices = (('', 'Non-US'),) + US_STATES, required=False )

    reason =  forms.CharField(label=_(" "),
                                required=True,
                                widget=forms.Textarea)



    def __init__(self, *args, **kwargs):
        super(ViewShareRegistrationForm, self).__init__(*args, **kwargs)
        self.org_type_choices = json.dumps([b.value for b in models.OrganizationType.objects.all().order_by("value")])
#        self.fields["username"].regex = r"^[\w.-_]+$"
        self.helper = FormHelper()
        self.helper.layout = Layout(
                Fieldset("User Information", "username", "email", "password1", "password2", css_class="inlineLabels"),
                Fieldset("Describe your Organization", "organization", "org_type", "org_state", css_class="inlineLabels"),
                Fieldset("How do you plan to use Viewshare?", "reason", css_class="inlineLabels")
            )
        self.helper.add_input(Submit('add', "Sign Up"))
