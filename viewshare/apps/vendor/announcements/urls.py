from django.conf.urls import *
from django.views.generic import list_detail

from viewshare.apps.vendor.announcements.models import Announcement
from viewshare.apps.vendor.announcements.views import *


announcement_detail_info = {
    "queryset": Announcement.objects.all(),
}

urlpatterns = patterns("",
    url(r"^(?P<object_id>\d+)/$", list_detail.object_detail,
        announcement_detail_info, name="announcement_detail"),
    url(r"^(?P<object_id>\d+)/hide/$", announcement_hide,
        name="announcement_hide"),
    url(r"^$", announcement_list, name="announcement_home"),
)
