from django import forms
from django.db import transaction
from freemix.dataset.models import Dataset
from django.utils.translation import ugettext_lazy as _

published_choices = choices=((True, "Public"), (False, "Private"))

class CreateDatasetForm(forms.Form):

    title = forms.CharField(label =_('Title'), max_length=255)

    description = forms.CharField(label=_('Description'),
                                  required=False)

    published = forms.ChoiceField(label=_("Published"),
                                  widget=forms.RadioSelect(),
                                  choices=published_choices,
                                  initial=True)


    profile = forms.CharField(widget=forms.HiddenInput())
    data = forms.CharField(widget=forms.HiddenInput())



    def __init__(self, *args, **kwargs):
        self.owner = kwargs.pop('owner')
        self.datasource = kwargs.pop('datasource')
        super(CreateDatasetForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        with transaction.commit_on_success():
            instance = Dataset.objects.create(title=self.cleaned_data["title"],
                                              description=self.cleaned_data["description"],
                                              owner=self.owner)

            instance.published = (self.cleaned_data["published"] == "True")
            instance.save()
            instance.update_data(self.cleaned_data["data"])
            instance.update_profile(self.cleaned_data["profile"])
            self.datasource.dataset = instance
            self.datasource.save()

        return instance





class EditDatasetDetailForm(forms.ModelForm):
    class Meta:
        model = Dataset
        fields = ("title", "description", "published",)

        widgets= {
            "published": forms.RadioSelect(choices=published_choices)
        }
