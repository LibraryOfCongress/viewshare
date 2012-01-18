from django import forms
from freemix.dataset.models import Dataset

class CreateDatasetForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.owner = kwargs.pop('owner')
        self.datasource = kwargs.pop('datasource')
        super(CreateDatasetForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(CreateDatasetForm, self).save(commit=False)
        instance.owner = self.owner

        instance.save()

        self.datasource.dataset = instance
        self.datasource.save()
        return instance

    class Meta:
        model = Dataset
        fields = ("title", "description", "published", "profile", "data")
        widgets= {
            "profile": forms.HiddenInput(),
            "data": forms.HiddenInput(),
            "published": forms.RadioSelect(choices=((True, "Public"), (False, "Private")))
        }


class EditDatasetDetailForm(forms.ModelForm):
    class Meta:
        model = Dataset
        fields = ("title", "description", "published",)

        widgets= {
            "published": forms.RadioSelect(choices=((True, "Public"), (False, "Private")))
        }
