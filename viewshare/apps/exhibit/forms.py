from django import forms
from django.core.exceptions import ObjectDoesNotExist
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

from viewshare.apps.exhibit.models import PublishedExhibit


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
        self.helper = FormHelper()
        self.helper.html5_required = True
        self.helper.add_input(Submit('Update', "Update"))

    def save(self, commit=True):
        instance = super(CreateExhibitForm, self).save(commit=False)
        instance.owner = self.draft.owner
        instance.save()

        try:
            # TODO cyclic reference to data source. Perhaps the DataSource
            # model should be moved into the exhibit app?
            source = self.draft.source

            if source:
                source.exhibit = instance
                source.save()
        except ObjectDoesNotExist:
            # TODO perhaps the draft should have a foreign key
            # to the source and sources should always point to
            # PublishedExhibit?
            pass

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
