import re
import hashlib
from random import random
from django import forms
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.translation import ugettext_lazy as _, ugettext
from django.contrib.auth import authenticate, login
from django.contrib.sites.models import Site
from django.contrib import messages
from django.core.mail import send_mail

from viewshare.apps.account import models
from viewshare.utilities import get_site_url


alnum_re = re.compile(r'^\w+$')


def generate_key(value):
    salt = hashlib.sha1(str(random())).hexdigest()[:5]
    return hashlib.sha1(salt + value + settings.SECRET_KEY).hexdigest()


class LoginForm(forms.Form):

    username = forms.CharField(label=_("Username"),
                               max_length=30,
                               widget=forms.TextInput())

    password = forms.CharField(label=_("Password"),
                               widget=forms.PasswordInput(render_value=False))
    remember = forms.BooleanField(label=_("Remember Me"),
                                  help_text=_("If checked you will stay logged"
                                              " in for 3 weeks"),
                                  required=False)

    user = None

    def clean(self):
        if self._errors:
            return
        user = authenticate(username=self.cleaned_data["username"],
                            password=self.cleaned_data["password"])
        if user:
            if user.is_active:
                self.user = user
            else:
                raise forms.ValidationError(_("This account is "
                                              "currently inactive."))
        else:
            raise forms.ValidationError(_("The username and/or password you "
                                          "specified are not correct."))
        return self.cleaned_data

    def login(self, request):
        if self.is_valid():
            login(request, self.user)
            msg = ugettext(u"Successfully logged in as %(username)s.")
            messages.success(request, msg % {'username': self.user.username})
            if self.cleaned_data['remember']:
                request.session.set_expiry(60 * 60 * 24 * 7 * 3)
            else:
                request.session.set_expiry(0)
            return True
        return False


class UserForm(forms.Form):

    def __init__(self, user=None, *args, **kwargs):
        self.user = user
        super(UserForm, self).__init__(*args, **kwargs)


class SetEmailForm(UserForm):
    email = forms.EmailField(label=_("Email"),
                             required=True,
                             widget=forms.TextInput(attrs={'size': '30'}))

    def save(self):

        email = self.cleaned_data["email"]

        temp_key = generate_key(email)

        models.EmailConfirmation.objects.filter(user=self.user).delete()

        models.EmailConfirmation.objects.create(user=self.user,
                                                temp_key=temp_key,
                                                email=email)

        url = get_site_url(reverse('acct_confirm_email', args=(temp_key,)))

        ctx = {
            "user": self.user,
            "activate_url": url,
            "SITE_NAME": settings.SITE_NAME,
            'CONTACT_EMAIL': settings.CONTACT_EMAIL,
        }
        subject = render_to_string("account/email_confirmation_subject.txt",
                                   ctx)

        message = render_to_string("account/email_confirmation_message.txt",
                                   ctx)

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])


class ChangePasswordForm(UserForm):

    oldpassword = forms.CharField(label=_("Current Password"),
                                  widget=forms.PasswordInput(render_value=False))

    password1 = forms.CharField(label=_("New Password"),
                                widget=forms.PasswordInput(render_value=False))

    password2 = forms.CharField(label=_("New Password (again)"),
                                widget=forms.PasswordInput(render_value=False))

    def clean_oldpassword(self):
        if not self.user.check_password(self.cleaned_data.get("oldpassword")):
            raise forms.ValidationError(_("Please type your "
                                          "current password."))
        return self.cleaned_data["oldpassword"]

    def clean_password2(self):
        if "password1" in self.cleaned_data and \
                "password2" in self.cleaned_data:
            if self.cleaned_data["password1"] != self.cleaned_data["password2"]:
                raise forms.ValidationError(_("You must type the same password "
                                              "each time."))
        return self.cleaned_data["password2"]

    def save(self):
        self.user.set_password(self.cleaned_data['password1'])
        self.user.save()


class SetPasswordForm(UserForm):

    password1 = forms.CharField(label=_("Password"),
                                widget=forms.PasswordInput(render_value=False))
    password2 = forms.CharField(label=_("Password (again)"),
                                widget=forms.PasswordInput(render_value=False))

    def clean_password2(self):

        password1 = self.cleaned_data.get("password1", None)

        password2 = self.cleaned_data.get("password2", None)

        if password2:
            if password1 != password2:
                raise forms.ValidationError(_("You must type the same "
                                              "password each time."))
        return password2

    def save(self):
        self.user.set_password(self.cleaned_data["password1"])
        self.user.save()


class ResetPasswordForm(forms.Form):

    email = forms.EmailField(label=_("Email"),
                             required=True,
                             widget=forms.TextInput(attrs={'size': '30'}))

    def clean_email(self):
        email = self.cleaned_data["email"]
        if User.objects.filter(email__iexact=email).count() == 0:
            raise forms.ValidationError(_("Email address not verified for any "
                                          "user account"))
        return email

    def save(self):
        email = self.cleaned_data["email"]
        for user in User.objects.filter(email__iexact=email):

            temp_key = generate_key(email)
            # save it to the password reset model
            password_reset = models.PasswordReset(user=user, temp_key=temp_key)
            password_reset.save()

            current_site = Site.objects.get_current()
            domain = unicode(current_site.domain)

            #send the password reset email
            subject = _("Password reset email sent")

            ctx = {
                "user": user,
                "temp_key": temp_key,
                "domain": domain,
                "SITE_NAME": settings.SITE_NAME,
                'CONTACT_EMAIL': settings.CONTACT_EMAIL,
            }

            message = render_to_string("account/password_reset_key_message.txt",
                                       ctx)

            send_mail(subject,
                      message,
                      settings.DEFAULT_FROM_EMAIL,
                      [user.email])
        return self.cleaned_data["email"]


class ResetPasswordKeyForm(forms.Form):

    password1 = forms.CharField(label=_("New Password"),
                                widget=forms.PasswordInput(render_value=False))

    password2 = forms.CharField(label=_("New Password (again)"),
                                widget=forms.PasswordInput(render_value=False))

    temp_key = forms.CharField(widget=forms.HiddenInput)

    def clean_temp_key(self):
        temp_key = self.cleaned_data.get("temp_key")
        password_reset = models.PasswordReset.objects.filter(temp_key=temp_key,
                                                             reset=False)
        if not (password_reset.count()) >= 1:
            raise forms.ValidationError(_("Temporary key is invalid."))
        return temp_key

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1", None)
        password2 = self.cleaned_data.get("password2", None)

        if password2 and password1 != password2:
                raise forms.ValidationError(_("You must type the same "
                                              "password each time."))
        return self.cleaned_data["password2"]

    def save(self):
        # get the password_reset object
        temp_key = self.cleaned_data.get("temp_key")
        password_reset = (models.PasswordReset.objects
                          .filter(temp_key__exact=temp_key, reset=False)
                          .order_by("-timestamp"))[0]

        # now set the new user password
        user = password_reset.user
        user.set_password(self.cleaned_data["password1"])
        user.save()

        # change all the password reset records to this person to be true.
        for password_reset in models.PasswordReset.objects.filter(user=user):
            password_reset.reset = True
            password_reset.save()
