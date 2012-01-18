from django import forms
from freemix.exhibit import conf
from freemix.exhibit.models import Exhibit, Theme, Canvas

class CreateExhibitForm(forms.ModelForm):

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
        instance.theme = Theme.objects.get(slug=instance.profile.get("theme", conf.DEFAULT_EXHIBIT_THEME))

        instance.save()
        return instance

    class Meta:
        model = Exhibit
        fields = ("title", "description", "published", "profile",)
        widgets= {
            "profile": forms.HiddenInput(),
            "published": forms.RadioSelect(choices=((True, "Public"), (False, "Private")))
        }

class UpdateExhibitDetailForm(forms.ModelForm):
    class Meta:
        model = Exhibit
        fields = ("title", "description", "published",)
        widgets = {
            "published": forms.RadioSelect(choices=((True, "Public"), (False, "Private")))
        }
