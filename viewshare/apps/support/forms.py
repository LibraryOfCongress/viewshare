from django import forms
from django.forms import widgets
from django.utils.translation import ugettext_lazy as _
from django.utils import simplejson as json
from . import models

class SupportIssueForm(forms.Form):
    """
    Base form for recollection support

    >>> f = SupportIssueForm({'contact_type':'email', 'contact_email':'test@example.com'})
    >>> f.is_valid()
    True
    >>>f.cleaned_data.get("contact_type_pretty")== _("E-mail")
    True
    """

    contact_type = forms.ChoiceField(required=True,
                                     choices=[('email',_('E-mail')), ('phone',_('Phone'))],
                                     label=_("Preferred Contact Method"))
    contact_email = forms.EmailField(required=False, max_length=200, label=_("E-mail address"))
    contact_phone = forms.CharField(required=False, max_length=25, label=_("Phone number"))
    browser = forms.ChoiceField(label=_("Browser"),
                               help_text=_("Please select your browser from the list, or 'Other' to enter an alternative"),
                               required=False)
    browser_text=forms.CharField(required=False, label=_("Browser Description"), help_text=_("Please describe your browser"))



    def __init__(self, *args, **kwargs):
        super(SupportIssueForm, self).__init__(*args, **kwargs)
        self.fields["browser"].choices = [('',''),] + [(b.key, b.value,) for b in models.BrowserPickListItem.objects.all()] + [('other', 'Other',),]

    def clean(self):
        cleaned_data = self.cleaned_data
        for val in self.fields['contact_type'].choices:
            if val[0] == cleaned_data.get('contact_type'):
                cleaned_data["contact_type_pretty"] = val[1]

        for val in self.fields['browser'].choices:
            if val[0] == cleaned_data.get('browser') and cleaned_data.get('browser') != 'other':
                cleaned_data["browser_text"] = val[1]
        return cleaned_data

    def clean_contact_email(self):
        contact_type = self.cleaned_data.get("contact_type")
        email = self.cleaned_data.get("contact_email")
        if contact_type == "email":
            if not email:
                raise forms.ValidationError(_("Please supply an e-mail address"))
            else:
                self.cleaned_data["contact_point"] = email
        return email

    def clean_contact_phone(self):
        contact_type = self.cleaned_data.get("contact_type")
        phone = self.cleaned_data.get("contact_phone")
        if contact_type == "phone":
            if not phone:
                raise forms.ValidationError(_("Please supply a phone number"))
            else:
                self.cleaned_data["contact_point"] = phone
        return phone

    def clean_browser_text(self):
        browser_text = self.cleaned_data.get("browser_text")
        browser = self.cleaned_data.get("browser")
        if browser:
            if not browser == "other":
                browser_text = models.BrowserPickListItem.objects.get(key=browser).value
            elif not browser_text:
                raise forms.ValidationError(_("Please describe your browser"))
        return browser_text

class DataLoadUploadIssueForm(SupportIssueForm):

    issue_reason = forms.ChoiceField(required=True, label=_("Reason"),
                                    help_text="Please select the issue you are experiencing, or 'Other' if it isn't listed")
    issue_reason_text = forms.CharField(required=False, label=_("Description"))

    file_format=forms.ChoiceField(required=True, label=_("Format"),
                                  help_text="Please select the format of the file you are attempting to load, or 'Other' to enter another format")
    file_format_text=forms.CharField(required=False, label=_("File Format Description"), help_text=_("Please describe your file format"))

    def __init__(self, *args, **kwargs):
        super(DataLoadUploadIssueForm, self).__init__(*args, **kwargs)
        self.fields["file_format"].choices = [(b.key, b.value,) for b in models.FileFormatPickListItem.objects.all()] + [('other', 'Other',),]
        self.fields["issue_reason"].choices = [(b.key, b.value,) for b in models.DataLoadReasonPickListItem.objects.all()] + [('other', 'Other',),]

    def clean_file_format_text(self):
        file_format_text = self.cleaned_data.get("file_format_text")
        file_format = self.cleaned_data.get("file_format")
        if file_format:
            if not file_format == "other":
                file_format_text = models.FileFormatPickListItem.objects.get(key=file_format).value
            elif not file_format_text:
                raise forms.ValidationError(_("Please describe your file format"))
        return file_format_text

    def clean_issue_reason_text(self):
        issue_reason_text = self.cleaned_data.get("issue_reason_text")
        issue_reason=self.cleaned_data.get("issue_reason")
        if not issue_reason == "other":
            issue_reason_text = models.DataLoadReasonPickListItem.objects.get(key=issue_reason).value
        elif not issue_reason_text:
            raise forms.ValidationError(_("Please describe your data loading issue"))
        return issue_reason_text


class DataLoadIgnoredFieldsIssueForm(SupportIssueForm):
    """
    Form for reporting ignored data in transformation
    """
    elements = forms.CharField(required=True, widget=widgets.Textarea, help_text=_("Please edit this list to highlight the elements or attributes for which you would like support"))

    comments = forms.CharField(required=False, widget=widgets.Textarea,
                               label=_("Additional Comments"),
                               help_text=_("Any additional information about your data or the issue you are experiencing that could be helpful"))




class AugmentationIssueForm(SupportIssueForm):
    """
    Form for data augmentation support.

    Requires that the `profile_json` field be populated with a JSON snapshot of the dataset
    """
    profile_json = forms.CharField(required=True, widget=widgets.HiddenInput)
    field_name = forms.CharField(required=False,
                                 label="Augmented Field",
                                 help_text=_("Enter a label to highlight a particular field"))
    comments = forms.CharField(required=False, widget=widgets.Textarea,
                               label=_("Additional Comments"),
                               help_text=_("Any additional information about your data or the issue you are experiencing that could be helpful"))

    def clean_profile_json(self):
        try:
            return json.loads(self.cleaned_data.get("profile_json"))
        except:
            raise forms.ValidationError(_("Invalid profile description"))
