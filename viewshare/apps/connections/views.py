from django.db.models.aggregates import Count
from django.http import Http404
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from django.utils.translation import ugettext_lazy as _

from viewshare.apps.vendor.friends.models import *
from freemix.dataset.models import Dataset
from freemix.permissions import PermissionsRegistry
from django.views.generic.list import ListView
from freemix.utils import get_user
from freemix.exhibit.models import Exhibit


def connections(request, template_name="connections/invitations.html"):
    if request.method == "POST":
        invitation_id = request.POST.get("invitation", None)
        if request.POST["action"] == "accept":
            try:
                invitation = FriendshipInvitation.objects.get(id=invitation_id)
                if invitation.to_user == request.user:
                    invitation.accept()
                    messages.success(request, _("Accepted connection to %(from_user)s") %
                                              {'from_user': invitation.from_user})
            except FriendshipInvitation.DoesNotExist:
                pass

        elif request.POST["action"] == "decline":
            try:
                invitation = FriendshipInvitation.objects.get(id=invitation_id)
                if invitation.to_user == request.user:
                    invitation.decline()
                    messages.success(request, _("Declined connection to %(from_user)s") %
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

class ConnectionListByUserView(ListView):
    template_name = "connections/connection_list_by_user.html"

    def get_queryset(self):
        return Friendship.objects.friends_for_user(get_user(self.kwargs.get("username")))

    def get_context_data(self,**kwargs):
        kwargs = super(ConnectionListByUserView, self).get_context_data(**kwargs)

        kwargs["other_user"] = get_user(self.kwargs.get("username"))
        return kwargs

connection_list_by_user = ConnectionListByUserView.as_view()



class DatasetListConnectionsView(ListView):
    """
    Returns a list of datasets belonging to the connections of a particular user.
    """

    template_name="connections/dataset_list_by_user_connections.html"
    def get_queryset(self):
        vars = self.request.GET
        sort = vars.get('sort', None)
        if sort:
            if sort not in Dataset._meta.get_all_field_names():
                raise Http404("%s is not a valid sorting field"%sort)

        user = get_object_or_404(User, username=self.kwargs.get("username"))
        pre_friend_ids = [i['friend'].id for i in
                          Friendship.objects.friends_for_user(user)]
        list = Dataset.objects.filter(owner__pk__in=pre_friend_ids)
        list = list.select_related("owner",)
#        list = list.annotate(exhibit_count=Count('exhibits'))
        list = list.filter(PermissionsRegistry.get_filter("dataset.can_view", self.request.user))

        if sort:
            dir = vars.get('dir', "desc")
            order_by = (dir=="desc" and "-" or "") + sort
            list = list.order_by(order_by)

        return list

    def get_context_data(self, **kwargs):
        kwargs = super(DatasetListConnectionsView, self).get_context_data(**kwargs)

        kwargs["other_user"] = get_object_or_404(User,
                                            username=self.kwargs.get("username"))
        return kwargs

datasets_by_user_connections = DatasetListConnectionsView.as_view()


class ExhibitListConnectionsView(ListView):
    """
    Returns a list of datasets for a particular user on GET.
    """
    template_name = "connections/exhibit_list_by_user_connections.html"
    def get_queryset(self):
        vars = self.request.GET
        sort = vars.get('sort', None)
        if sort:
            if sort not in Exhibit._meta.get_all_field_names():
                raise Http404("%s is not a valid sorting field"%sort)

        user = get_object_or_404(User, username=self.kwargs.get("username"))

        pre_friend_ids = [i['friend'].id for i in
                          Friendship.objects.friends_for_user(user)]
        perm_filter = PermissionsRegistry.get_filter("exhibit.can_view", self.request.user)
        list = Exhibit.objects.filter(owner__pk__in=pre_friend_ids).filter(perm_filter)
        list = list.select_related("owner", "dataset", "dataset__owner")
        if sort:
            dir = vars.get('dir', "desc")
            order_by = (dir=="desc" and "-" or "") + sort
            list = list.order_by(order_by)

        return list

    def get_context_data(self, **kwargs):
        kwargs["other_user"] = get_object_or_404(User,
                                            username=self.kwargs.get("username"))
        return kwargs

exhibit_list_by_user_connections = ExhibitListConnectionsView.as_view()
