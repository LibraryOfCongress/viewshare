import uuid
from django import forms
from django.forms.widgets import Select
from django.utils.translation import ugettext_lazy as _
from viewshare.apps.upload import models
from viewshare.apps.exhibit import models as exhibit_models


class DataSourceForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.user = None
        if "user" in kwargs:
            self.user = kwargs.pop('user')
        super(DataSourceForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super(DataSourceForm, self).save(commit=False)

        if not hasattr(instance, 'exhibit'):
            owner = self.user
            slug = str(uuid.uuid4())
            instance.exhibit = exhibit_models.DraftExhibit.objects.create(
                owner=owner,
                slug=slug,
                profile={}
            )
        instance.save()
        return instance

    class Meta:
        model = models.DataSource
        exclude = ('owner', 'exhibit')


class FileDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.FileDataSource


class URLDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.URLDataSource


class ContentDMDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.ContentDMDataSource

    def clean(self):
        cleaned = super(ContentDMDataSourceForm, self).clean()
        collection = cleaned.get("collection", '').strip()
        query = cleaned.get("query", '').strip()
        if len(collection) == 0 and len(query) == 0:
            raise forms.ValidationError(
                _("A CONTENTdm collection name or search term is required"))
        if len(collection) > 0 and collection[0] != '/':
            m = _('A CONTENTdm collection name must start with "/"')
            self._errors["collection"] = self.error_class([m])
            del cleaned["collection"]
        return cleaned


class OAIDataSourceForm(DataSourceForm):
    set_choice = forms.CharField(label=_("Set"), widget=Select)

    def clean_set_choice(self):
        cleaned = self.cleaned_data
        if not ("title" in cleaned and "set" in cleaned):
            raise forms.ValidationError(_("Set is required"))
        return self.cleaned_data.get("set")

    class Meta(DataSourceForm.Meta):
        model = models.OAIDataSource
        fields = ("url", "title", "set", "set_choice", "limit",)
        widgets = {
            "title": forms.HiddenInput(),
            "set": forms.HiddenInput()
        }


class ModsURLDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.ModsURLDataSource


class ModsFileDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.ModsFileDataSource


class JSONURLDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.JSONURLDataSource


class JSONFileDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.JSONFileDataSource


class ReferenceDataSourceForm(DataSourceForm):

    class Meta(DataSourceForm.Meta):
        model = models.ReferenceDataSource
