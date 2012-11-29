from django import forms
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

from viewshare.apps.vendor.friends.models import *

from viewshare.apps.vendor.notification import models as notification


if "emailconfirmation" in settings.INSTALLED_APPS:
    from emailconfirmation.models import EmailAddress
else:
    EmailAddress = None

class UserForm(forms.Form):
    
    def __init__(self, user=None, *args, **kwargs):
        self.user = user
        super(UserForm, self).__init__(*args, **kwargs)

if EmailAddress:
    class JoinRequestForm(forms.Form):
    
        email = forms.EmailField(label="Email", required=True, widget=forms.TextInput(attrs={'size':'30'}))
        message = forms.CharField(label="Message", required=False, widget=forms.Textarea(attrs = {'cols': '30', 'rows': '5'}))
    
        def clean_email(self):
            # @@@ this assumes email-confirmation is being used
            self.existing_users = EmailAddress.objects.get_users_for(self.cleaned_data["email"])
            if self.existing_users:
                raise forms.ValidationError(u"Someone with that email address is already here.")
            return self.cleaned_data["email"]
    
        def save(self, user):
            join_request = JoinInvitation.objects.send_invitation(user, self.cleaned_data["email"], self.cleaned_data["message"])
            return join_request
    
class InviteFriendForm(UserForm):
    
    to_user = forms.CharField(widget=forms.HiddenInput)
    message = forms.CharField(label="Message", required=False, widget=forms.Textarea(attrs = {'cols': '20', 'rows': '5'}))
    
    def clean_to_user(self):
        to_username = self.cleaned_data["to_user"]
        try:
            User.objects.get(username=to_username)
        except User.DoesNotExist:
            raise forms.ValidationError(_(u"Unknown user."))
            
        return self.cleaned_data["to_user"]
    
    def clean(self):
        to_user = User.objects.get(username=self.cleaned_data["to_user"])
        previous_invitations_to = FriendshipInvitation.objects.invitations(to_user=to_user, from_user=self.user)
        if previous_invitations_to.count() > 0:
            raise forms.ValidationError(_(u"Already requested friendship with %s") % to_user.username)
        # check inverse
        previous_invitations_from = FriendshipInvitation.objects.invitations(to_user=self.user, from_user=to_user)
        if previous_invitations_from.count() > 0:
            raise forms.ValidationError(_(u"%s has already requested friendship with you") % to_user.username)
        return self.cleaned_data
    
    def save(self):
        to_user = User.objects.get(username=self.cleaned_data["to_user"])
        message = self.cleaned_data["message"]
        invitation = FriendshipInvitation(from_user=self.user, to_user=to_user, message=message, status="2")
        invitation.save()
        if notification:
            notification.send([to_user], "friends_invite", {"invitation": invitation})
            notification.send([self.user], "friends_invite_sent", {"invitation": invitation})
        return invitation
