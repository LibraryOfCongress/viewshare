from django import forms
from viewshare.apps.augment.models import ListPattern

_choices = (("delimiter", "Delimiter"),
            ("pattern", "Regular Expression Pattern"))


class ListPatternForm(forms.ModelForm):

    type = forms.ChoiceField(choices=_choices)

    class Meta:
        model = ListPattern
