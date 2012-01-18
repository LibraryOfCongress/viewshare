from django import forms
from .models import ListPattern

class ListPatternForm(forms.ModelForm):
    
    type = forms.ChoiceField(choices=(("delimiter", "Delimiter"), 
                                      ("pattern", "Regular Expression Pattern")))
    class Meta:
        model=ListPattern
