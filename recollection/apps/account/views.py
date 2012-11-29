from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, HttpResponseForbidden
from django.template import RequestContext
from django.utils.translation import  ugettext_lazy as _
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from recollection.apps.account.utils import get_default_redirect
from recollection.apps.account.forms import AddEmailForm, LoginForm, \
    ChangePasswordForm, SetPasswordForm, ResetPasswordForm, \
    ChangeTimezoneForm, ChangeLanguageForm, ResetPasswordKeyForm
from emailconfirmation.models import EmailAddress, EmailConfirmation

def login(request, form_class=LoginForm, template_name="account/login.html",
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
    return render_to_response(template_name, ctx,
        context_instance = RequestContext(request)
    )

def confirmation_message(request, email):
    messages.success(request, _("Confirmation email sent to %(email)s") % {
                                                    'email': email,
                                                })

@login_required
def email(request, form_class=AddEmailForm,
        template_name="account/email.html"):
    if request.method == "POST" and request.user.is_authenticated():
        if request.POST["action"] == "add":
            add_email_form = form_class(request.user, request.POST)
            if add_email_form.is_valid():
                add_email_form.save()
                confirmation_message(request, request.POST["email"])
                add_email_form = form_class() # @@@
        else:
            add_email_form = form_class()
            if request.POST["action"] == "send":
                email = request.POST["email"]
                try:
                    email_address = EmailAddress.objects.get(
                        user=request.user,
                        email=email,
                    )
                    confirmation_message(request, email)

                    EmailConfirmation.objects.send_confirmation(email_address)
                except EmailAddress.DoesNotExist:
                    pass
            elif request.POST["action"] == "remove":
                email = request.POST["email"]
                try:
                    email_address = EmailAddress.objects.get(
                        user=request.user,
                        email=email
                    )
                    email_address.delete()
                    messages.success(request, _("Removed email address %(email)s") % {
                            'email': email,
                        })
                except EmailAddress.DoesNotExist:
                    pass
            elif request.POST["action"] == "primary":
                email = request.POST["email"]
                email_address = EmailAddress.objects.get(
                    user=request.user,
                    email=email,
                )
                email_address.set_as_primary()
    else:
        add_email_form = form_class()
    return render_to_response(template_name, {
        "add_email_form": add_email_form,
    }, context_instance=RequestContext(request))

@login_required
def password_change(request, form_class=ChangePasswordForm,
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
    return render_to_response(template_name, {
        "password_change_form": password_change_form,
    }, context_instance=RequestContext(request))

@login_required
def password_set(request, form_class=SetPasswordForm,
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
    return render_to_response(template_name, {
        "password_set_form": password_set_form,
    }, context_instance=RequestContext(request))

@login_required
def password_delete(request, template_name="account/password_delete.html"):
    # prevent this view when openids is not present or it is empty.
    if not request.user.password:
        return HttpResponseForbidden()
    if request.method == "POST":
        request.user.password = u""
        request.user.save()
        return HttpResponseRedirect(reverse("acct_passwd_delete_done"))
    return render_to_response(template_name, {
    }, context_instance=RequestContext(request))

def password_reset(request, form_class=ResetPasswordForm,
        template_name="account/password_reset.html",
        template_name_done="account/password_reset_done.html"):
    if request.method == "POST":
        password_reset_form = form_class(request.POST)
        if password_reset_form.is_valid():
            email = password_reset_form.save()
            messages.success(request, _(u"Password successfully changed."))

            return render_to_response(template_name_done, {
                "email": email,
            }, context_instance=RequestContext(request))
    else:
        password_reset_form = form_class()
    
    return render_to_response(template_name, {
        "password_reset_form": password_reset_form,
    }, context_instance=RequestContext(request))
    
def password_reset_from_key(request, key, form_class=ResetPasswordKeyForm,
        template_name="account/password_reset_from_key.html"):
    if request.method == "POST":
        password_reset_key_form = form_class(request.POST)
        if password_reset_key_form.is_valid():
            password_reset_key_form.save()
            password_reset_key_form = None
    else:
        password_reset_key_form = form_class(initial={"temp_key": key})
    
    return render_to_response(template_name, {
        "form": password_reset_key_form,
    }, context_instance=RequestContext(request))
    
@login_required
def timezone_change(request, form_class=ChangeTimezoneForm,
        template_name="account/timezone_change.html"):
    if request.method == "POST":
        form = form_class(request.user, request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, _(u"Timezone successfully updated."))

    else:
        form = form_class(request.user)
    return render_to_response(template_name, {
        "form": form,
    }, context_instance=RequestContext(request))

@login_required
def language_change(request, form_class=ChangeLanguageForm,
        template_name="account/language_change.html"):
    if request.method == "POST":
        form = form_class(request.user, request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, _(u"Language successfully updated."))

            next = request.META.get('HTTP_REFERER', None)
            return HttpResponseRedirect(next)
    else:
        form = form_class(request.user)
    return render_to_response(template_name, {
        "form": form,
    }, context_instance=RequestContext(request))
