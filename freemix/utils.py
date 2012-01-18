from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404
from django.contrib.sites.models import Site

def get_username(user):
    if isinstance(user,User) and not isinstance(user, AnonymousUser):
        return user.username
    return getattr(settings, "ANONYMOUS_USERNAME", "Anonymous")

def get_user(username):
    if username==getattr(settings, "ANONYMOUS_USERNAME", "Anonymous"):
        return None
    return get_object_or_404(User,username=username)

def get_site_url(path="/"):
    return "http://%s%s"%(Site.objects.get_current().domain, path)
