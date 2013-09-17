from datetime import timedelta, datetime
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, Http404
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.generic import FormView, View
from viewshare.apps.account import models

from viewshare.apps.account.utils import get_default_redirect
from viewshare.apps.account import forms


def login(request, form_class=forms.LoginForm,
          template_name="account/login.html",
          success_url=None,
          url_required=False, extra_context=None):
    if extra_context is None:
        extra_context = {}
    if success_url is None:
        success_url = get_default_redirect(request)
    if request.method == "POST" and not url_required:
        form = form_class(request.POST)
        if form.login(request):

            return HttpResponseRedirect(success_url)
    else:
        form = form_class()
    ctx = {
        "form": form,
        "url_required": url_required,
    }
    ctx.update(extra_context)
    return render(request, template_name, ctx)


class SetEmailView(FormView):
    template_name = "account/email.html"
    form_class = forms.SetEmailForm

    def form_valid(self, form):

        form.save()

        email = form.cleaned_data["email"]
        msg = _("Confirmation email sent to %(email)s") % {'email': email}

        messages.success(self.request, msg)

        return HttpResponseRedirect(reverse('acct_email'))

    def get_form_kwargs(self):
        kwargs = super(SetEmailView, self).get_form_kwargs()
        kwargs["user"] = self.request.user
        return kwargs

    def get_context_data(self, **kwargs):
        ctx = super(SetEmailView, self).get_context_data(**kwargs)
        delta = timedelta(days=models.EMAIL_CONFIRMATION_DAYS)
        earliest = datetime.now() - delta
        q = models.EmailConfirmation.objects.filter(user=self.request.user,
                                                    timestamp__gt=earliest)
        l = list(q[:1])
        if l:
            ctx["outstanding_request"] = l[0].email
        return ctx


class EmailConfirmationView(View):

    def get(self, request, *args, **kwargs):
        key = self.args[0]
        obj = get_object_or_404(models.EmailConfirmation,
                                temp_key=key)
        if obj.expired():
            obj.delete()
            raise Http404

        obj.confirm()
        return render(request,
                      "account/confirm_email.html",
                      {
                          "email_address": obj
                      })


@login_required
def password_change(request, form_class=forms.ChangePasswordForm,
        template_name="account/password_change.html"):
    if not request.user.password:
        return HttpResponseRedirect(reverse("acct_passwd_set"))
    if request.method == "POST":
        password_change_form = form_class(request.user, request.POST)
        if password_change_form.is_valid():
            password_change_form.save()
            messages.success(request, _(u"Password successfully changed."))

            password_change_form = form_class(request.user)
    else:
        password_change_form = form_class(request.user)
    return render(request, template_name, {
        "password_change_form": password_change_form,
    })


@login_required
def password_set(request, form_class=forms.SetPasswordForm,
                 template_name="account/password_set.html"):
    if request.user.password:
        return HttpResponseRedirect(reverse("acct_passwd"))
    if request.method == "POST":
        password_set_form = form_class(request.user, request.POST)
        if password_set_form.is_valid():
            password_set_form.save()
            messages.success(request, _(u"Password successfully set."))

            return HttpResponseRedirect(reverse("acct_passwd"))
    else:
        password_set_form = form_class(request.user)
    return render(request, template_name,
                  {"password_set_form": password_set_form})


def password_reset(request, form_class=forms.ResetPasswordForm,
                   template_name="account/password_reset.html",
                   template_name_done="account/password_reset_done.html"):
    if request.method == "POST":
        password_reset_form = form_class(request.POST)
        if password_reset_form.is_valid():
            email = password_reset_form.save()
            messages.success(request, _(u"Password successfully changed."))

            return render(request, template_name_done, {"email": email})
    else:
        password_reset_form = form_class()
    
    return render(request, template_name, {
        "password_reset_form": password_reset_form,
    })


def password_reset_from_key(request,
                            key,
                            form_class=forms.ResetPasswordKeyForm,
                            template_name="account/"
                                          "password_reset_from_key.html"):
    count = models.PasswordReset.objects.filter(temp_key=key,
                                                reset=False).count()
    if count == 0:
        return render(request, template_name, {"invalid_key": True})

    if request.method == "POST":
        password_reset_key_form = form_class(request.POST)
        if password_reset_key_form.is_valid():
            password_reset_key_form.save()
            password_reset_key_form = None
    else:
        password_reset_key_form = form_class(initial={"temp_key": key})
    
    return render(request, template_name, {
        "form": password_reset_key_form,
    })
