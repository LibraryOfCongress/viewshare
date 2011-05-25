from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse

def user_home(request):
    return HttpResponseRedirect(reverse('profile_detail', kwargs={'username': request.user.username}))
user_home = login_required(user_home)
