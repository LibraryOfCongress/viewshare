from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages

from django.utils.translation import ugettext_lazy as _
from django.utils.translation import ugettext

from viewshare.apps.vendor.friends.forms import InviteFriendForm
from viewshare.apps.vendor.friends.models import FriendshipInvitation, Friendship
from freemix.permissions import PermissionsRegistry

from .apps.profiles.forms import ProfileForm


def profiles(request, template_name="profiles/profiles.html", extra_context=None):
    if extra_context is None:
        extra_context = {}
    users = User.objects.all().order_by("-date_joined")

#    f = PermissionsRegistry.get_filter("exhibit.can_view", request.user, "exhibits")

#    users = users.filter(f)
#
#    users = users.annotate(exhibit_count=Count("exhibits", distinct=True), dataset_count=Count("datasets", distinct=True))
#    users = users.select_related("profile", "exhibit_count")

    users = users.select_related("profile")
    search_terms = request.GET.get('search', '')
    order = request.GET.get('order')
    if not order:
        order = 'date'
    if search_terms:
        users = users.filter(username__icontains=search_terms)
    if order == 'date':
        users = users.order_by("-date_joined")
    elif order == 'name':
        users = users.order_by("username")
    return render_to_response(template_name, dict({
        'users': users,
        'order': order,
        'search_terms': search_terms,
    }, **extra_context), context_instance=RequestContext(request))


def profile(request, username, template_name="profiles/profile.html", extra_context=None):

    if extra_context is None:
        extra_context = {}

    other_user = get_object_or_404(User, username=username)

    if request.user.is_authenticated():
        is_friend = Friendship.objects.are_friends(request.user, other_user)
        other_friends = Friendship.objects.friends_for_user(other_user)
        if request.user == other_user:
            is_me = True
        else:
            is_me = False
        previous_invitations_to = FriendshipInvitation.objects.invitations(to_user=other_user, from_user=request.user)
        previous_invitations_from = FriendshipInvitation.objects.invitations(to_user=request.user, from_user=other_user)
    else:
        other_friends = []
        is_friend = False
        is_me = False

        previous_invitations_to = None
        previous_invitations_from = None

    if is_friend:
        invite_form = None
        if request.method == "POST":
            if request.POST.get("action") == "remove": # @@@ perhaps the form should just post to friends and be redirected here
                Friendship.objects.remove(request.user, other_user)
                messages.success(request, _("You have removed %(from_user)s from your connections") % {'from_user': other_user})

                is_friend = False
                invite_form = InviteFriendForm(request.user, {
                    'to_user': username,
                    'message': ugettext("Let's Connect!"),
                })

    else:
        if request.user.is_authenticated() and request.method == "POST":
            if request.POST.get("action") == "invite": # @@@ perhaps the form should just post to friends and be redirected here
                invite_form = InviteFriendForm(request.user, request.POST)
                if invite_form.is_valid():
                    invite_form.save()
                    messages.success(request, _("Connection requested with %s") % invite_form.cleaned_data["to_user"]) # @@@ make link like notification

            else:
                invite_form = InviteFriendForm(request.user, {
                    'to_user': username,
                    'message': ugettext("Let's be Connect!"),
                })
                invitation_id = request.POST.get("invitation", None)
                if request.POST.get("action") == "accept": # @@@ perhaps the form should just post to friends and be redirected here
                    try:
                        invitation = FriendshipInvitation.objects.get(id=invitation_id)
                        if invitation.to_user == request.user:
                            invitation.accept()
                            messages.success(request, _("You have accepted the connection request from %(from_user)s") % {'from_user': invitation.from_user})
                            is_friend = True
                            other_friends = Friendship.objects.friends_for_user(other_user)
                    except FriendshipInvitation.DoesNotExist:
                        pass
                elif request.POST.get("action") == "decline": # @@@ perhaps the form should just post to friends and be redirected here
                    try:
                        invitation = FriendshipInvitation.objects.get(id=invitation_id)
                        if invitation.to_user == request.user:
                            invitation.decline()
                            messages.success(request, _("You have declined the connection request from %(from_user)s") % {'from_user': invitation.from_user})
                            other_friends = Friendship.objects.friends_for_user(other_user)
                    except FriendshipInvitation.DoesNotExist:
                        pass
        else:
            invite_form = InviteFriendForm(request.user, {
                'to_user': username,
                'message': ugettext("Let's Connect!"),
            })

    datasets = other_user.datasets.filter(PermissionsRegistry.get_filter("dataset.can_view", request.user))
    datasets = datasets.select_related("owner")
    exhibits = other_user.exhibits.filter(PermissionsRegistry.get_filter("exhibit.can_view", request.user))
    exhibits = exhibits.select_related("owner", "dataset__owner", "dataset")
    return render_to_response(template_name, dict({
        "is_me": is_me,
        "is_friend": is_friend,
        "other_user": other_user,
        "datasets": datasets,
        "exhibits":exhibits,
        "other_friends": other_friends,
        "invite_form": invite_form,
        "previous_invitations_to": previous_invitations_to,
        "previous_invitations_from": previous_invitations_from,
    }, **extra_context), context_instance=RequestContext(request))


@login_required
def profile_edit(request, form_class=ProfileForm, **kwargs):

    template_name = kwargs.get("template_name", "profiles/profile_edit.html")

    if request.is_ajax():
        template_name = kwargs.get(
            "template_name_facebox",
            "profiles/profile_edit_facebox.html"
        )

    profile = request.user.get_profile()

    if request.method == "POST":
        profile_form = form_class(request.POST, instance=profile)
        if profile_form.is_valid():
            profile = profile_form.save(commit=False)
            profile.user = request.user
            profile.save()
            return HttpResponseRedirect(reverse("profile_detail", args=[request.user.username]))
    else:
        profile_form = form_class(instance=profile)

    return render_to_response(template_name, {
        "profile": profile,
        "profile_form": profile_form,
    }, context_instance=RequestContext(request))

