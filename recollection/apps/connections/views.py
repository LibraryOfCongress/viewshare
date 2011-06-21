from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

from django.utils.translation import ugettext_lazy as _

from friends.models import *
from freemix.dataset.models import Dataset
from freemix.permissions import PermissionsRegistry
from freemix.utils.views import LegacyListView
from django.views.generic.list import ListView
from freemix.utils import get_user
from freemix.freemixprofile.models import Freemix


def connections(request, template_name="connections/invitations.html"):
    if request.method == "POST":
        invitation_id = request.POST.get("invitation", None)
        if request.POST["action"] == "accept":
            try:
                invitation = FriendshipInvitation.objects.get(id=invitation_id)
                if invitation.to_user == request.user:
                    invitation.accept()
                    request.user.message_set.create(message=_("Accepted connection to %(from_user)s") %
                                                            {'from_user': invitation.from_user})
            except FriendshipInvitation.DoesNotExist:
                pass

        elif request.POST["action"] == "decline":
            try:
                invitation = FriendshipInvitation.objects.get(id=invitation_id)
                if invitation.to_user == request.user:
                    invitation.decline()
                    request.user.message_set.create(message=_("Declined connection to %(from_user)s") %
                        {'from_user': invitation.from_user})
            except FriendshipInvitation.DoesNotExist:
                pass

    invites_received = request.user.invitations_to.invitations().order_by("-sent")
    invites_sent = request.user.invitations_from.invitations().order_by("-sent")
    joins_sent = request.user.join_from.all().order_by("-sent")

    return render_to_response(template_name, {
        "invites_received": invites_received,
        "invites_sent": invites_sent,
        "joins_sent": joins_sent,
    }, context_instance=RequestContext(request))
connections = login_required(connections)

class ConnectionListByUserView(LegacyListView):
    template = "connections/connection_list_by_user.html"

    def get_queryset(self, request, username, other_user):
        return Friendship.objects.friends_for_user(user=get_user(username))

    def extra_context(self, request, username):
        return {"other_user": get_user(username)}
connection_list_by_user = ConnectionListByUserView()



class DatasetListConnectionsView(ListView):
    """
    Returns a list of datasets belonging to the connections of a particular user.
    """

    template_name="connections/dataset_list_by_user_connections.html"
    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs.get("username"))
        pre_friend_ids = [i['friend'].id for i in
                          Friendship.objects.friends_for_user(user)]
        list = Dataset.objects.filter(owner__pk__in=pre_friend_ids)
        list = list.filter(PermissionsRegistry.get_filter("dataset.can_view", self.request.user))
        return list

    def get_context_data(self, **kwargs):
        kwargs["other_user"] = get_object_or_404(User,
                                            username=self.kwargs.get("username"))
        return kwargs

datasets_by_user_connections = DatasetListConnectionsView.as_view()


class DataViewListConnectionsView(LegacyListView):
    """
    Returns a list of datasets for a particular user on GET.
    """
    template = "connections/dataview_list_by_user_connections.html"
    def get_queryset(self, request, username, other_user):
        pre_friend_ids = [i['friend'].id for i in
                          Friendship.objects.friends_for_user(get_user(username))]
        perm_filter = PermissionsRegistry.get_filter("exhibit.can_view", request.user)
        return Freemix.objects.filter(user__pk__in=pre_friend_ids).filter(perm_filter)

    def extra_context(self, request, username):
        return { "other_user": get_user(username)}
dataviews_by_user_connections = DataViewListConnectionsView()
