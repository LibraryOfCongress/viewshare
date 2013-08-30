from django import forms
from django.conf import settings
from freemix.exhibit import conf
from freemix.exhibit.models import PublishedExhibit
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

def boolean_coerce(value):
    # value is received as a unicode string
   if str(value).lower() in ( '1', 'true' ):
       return True
   elif str(value).lower() in ( '0', 'false' ):
       return False
   return None

class CreateExhibitForm(forms.ModelForm):

    is_public = forms.TypedChoiceField(
        label = "",
        choices = ((True, "Public"), (False, "Private")),
        coerce = boolean_coerce,
        widget = forms.RadioSelect,
        initial = True,
        required = True,
    )

    def __init__(self, *args, **kwargs):
        self.owner = kwargs.pop('owner')
        self.dataset = kwargs.pop('dataset')
        self.canvas = kwargs.pop('canvas')
        super(CreateExhibitForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(CreateExhibitForm, self).save(commit=False)
        instance.owner = self.owner
        instance.dataset = self.dataset
        instance.canvas = self.canvas

        instance.save()
        return instance

    class Meta:
        model = PublishedExhibit
        fields = ("title", "description", "is_public", "profile",)
        widgets= {
            "profile": forms.HiddenInput(),
            "is_public": forms.RadioSelect(choices=((True, "Public"), (False, "Private")))
        }


class UpdateExhibitDetailForm(forms.ModelForm):

    is_public = forms.TypedChoiceField(
        label = "",
        choices = ((True, "Public"), (False, "Private")),
        coerce = boolean_coerce,
        widget = forms.RadioSelect,
        initial = True,
        required = True,
    )

    class Meta:
        model = PublishedExhibit
        fields = ("title", "description", "is_public",)

    def __init__(self, *args, **kwargs):
        super(UpdateExhibitDetailForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.html5_required = True
        self.helper.add_input(Submit('Update', "Update"))
