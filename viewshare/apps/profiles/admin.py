from django.contrib import admin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django import forms
from django.utils.translation import ugettext_lazy as _

from viewshare.apps.profiles.models import Profile



# Override the user admin to reflect the regex for usernames
class UserCreationForm(UserCreationForm):
    username = forms.RegexField(
        label=_("Username"),
        max_length=30,
        regex=r"^[\w.-_]+$",
        help_text = _("Required. 30 characters or fewer. Letters, digits and ./-/_ only."),
        error_messages = {'invalid': _("This value may contain only letters, numbers and ./-/_ characters.")})

class UserChangeForm(UserChangeForm):
    username = forms.RegexField(
        label=_("Username"),
        max_length=30,
        regex=r"^[\w.-_]+$",
        help_text = _("Required. 30 characters or fewer. Letters, digits and ./-/_ only."),
        error_messages = {'invalid': _("This value may contain only letters, numbers and ./-/_ characters.")})

class UserProfileAdmin(UserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

admin.site.unregister(User)
admin.site.register(User, UserProfileAdmin)


admin.site.register(Profile)

