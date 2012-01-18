from django import forms
from freemix.exhibit.share import models

class CreateSharedExhibitKeyForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        self.exhibit = kwargs.pop('exhibit')
        super(CreateSharedExhibitKeyForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(CreateSharedExhibitKeyForm,self).save(commit=False)
        instance.exhibit = self.exhibit
        instance.save()
        return instance

    class Meta:
        model = models.SharedExhibitKey
        fields = ("label",)
        widgets = {"label": forms.TextInput}
        