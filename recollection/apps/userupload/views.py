from django.http import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse

def user_upload(request):
    return HttpResponseRedirect(reverse('upload_dataset'))
user_upload = login_required(user_upload)
