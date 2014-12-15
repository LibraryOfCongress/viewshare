from django.conf import settings
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.sites.models import Site
from django.shortcuts import get_object_or_404


def get_site_url(path="/"):
    return "http://%s%s" % (Site.objects.get_current().domain, path)


def get_username(user):
    if isinstance(user, User) and not isinstance(user, AnonymousUser):
        return user.username
    return getattr(settings, "ANONYMOUS_USERNAME", "Anonymous")


def get_user(username):
    if username == getattr(settings, "ANONYMOUS_USERNAME", "Anonymous"):
        return None
    return get_object_or_404(User, username=username)
