from django import forms
from freemix.exhibit.models import PublishedExhibit
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit


def boolean_coerce(value):
    # value is received as a unicode string
    if str(value).lower() in ('1', 'true'):
        return True
    elif str(value).lower() in ('0', 'false'):
        return False
    return None


class CreateExhibitForm(forms.ModelForm):

    is_public = forms.TypedChoiceField(
        label="",
        choices=((True, "Public"), (False, "Private")),
        coerce=boolean_coerce,
        widget=forms.RadioSelect,
        initial=True,
        required=True,
    )

    def __init__(self, *args, **kwargs):
        self.draft = kwargs.pop("draft")
        super(CreateExhibitForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(CreateExhibitForm, self).save(commit=False)
        instance.owner = self.draft.owner
        instance.canvas = self.draft.canvas

        instance.save()
        self.draft.parent = instance
        self.draft.save()
        self.draft.publish()
        return instance

    class Meta:
        model = PublishedExhibit
        fields = ("title", "description", "is_public")


class UpdateExhibitDetailForm(forms.ModelForm):

    is_public = forms.TypedChoiceField(
        label="",
        choices=((True, "Public"), (False, "Private")),
        coerce=boolean_coerce,
        widget=forms.RadioSelect,
        initial=True,
        required=True,
    )

    class Meta:
        model = PublishedExhibit
        fields = ("title", "description", "is_public",)

    def __init__(self, *args, **kwargs):
        super(UpdateExhibitDetailForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.html5_required = True
        self.helper.add_input(Submit('Update', "Update"))
