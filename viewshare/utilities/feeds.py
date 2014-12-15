from django.contrib.auth.models import AnonymousUser
from django.contrib.syndication.views import Feed
from django.utils.feedgenerator import Atom1Feed
from django.core.urlresolvers import reverse

from viewshare.apps.exhibit.permissions import PermissionsRegistry
from viewshare.apps.exhibit.models import PublishedExhibit
from viewshare.utilities import get_site_url, get_user


class ItemMixin:
    def item_pubdate(self, item):
        return item.modified

    def item_description(self, item):
        return item.description

    def item_title(self, item):
        return item.title

    def item_author_name(self, item):
        return item.owner.username

    def item_author_link(self, item):
        return item.owner.get_absolute_url()


class LatestDataViews(ItemMixin, Feed):
    title = "Latest Data Views"
    description = "Latest Data Views"
    link = get_site_url()

    def items(self):
        u = AnonymousUser()
        filter = PermissionsRegistry.get_filter('exhibit.can_view', u)

        return PublishedExhibit.objects.filter(filter).order_by('-created')[:10]


class AtomLatestDataViews(LatestDataViews):
    feed_type = Atom1Feed
    subtitle = LatestDataViews.description


class UserDataViews(ItemMixin, Feed):

    # Parse the username from the URL
    def get_object(self, request, owner=None):

        return get_user(username=owner)

    def title(self, obj):
        return "Latest Data Views created by %(user)s" % { 'user': obj.username }

    def description(self, obj):
        return "Latest Data Views for %(user)s" % { 'user': obj.username }

    # Link to user's profile
    def link(self, obj):
        return get_site_url(reverse("profile_detail", kwargs={'username':
                    obj.username}))
    # Return only this user's Freemixes.
    def items(self, obj):
        u = AnonymousUser()
        filter = PermissionsRegistry.get_filter('exhibit.can_view', u)

        return PublishedExhibit.objects.filter(owner=obj).filter(filter).order_by('-created')[:10]


class AtomUserDataViews(UserDataViews):
    feed_type = Atom1Feed
    subtitle = UserDataViews.description
