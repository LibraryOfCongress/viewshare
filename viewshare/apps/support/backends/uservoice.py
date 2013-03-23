from django.conf import settings
import urllib2
from viewshare.apps.support.backends import BaseSupportBackend
import json


class UservoiceSupportBackend(BaseSupportBackend):

    def get_url(self):
        host = settings.USERVOICE_SETTINGS["HOST"]
        api_key = settings.USERVOICE_SETTINGS["API_KEY"]
        base_url = "http://%s/api/v1/tickets.json?client=%s"
        return base_url % (host, api_key,)

    def get_support_queue(self, key):
        trackers = settings.USERVOICE_SETTINGS.get("support_queues", {})
        return trackers.get(key, None)

    def create_issue(self, request, subject, message, tracker="default"):

        if not request.user.is_authenticated() or request.user.email is None:
            return {
                "no_email": True,
                "authenticated": request.user.is_authenticated()
            }

        values = {
            "format": "json",
            "email": request.user.email,
            "ticket": {
                "state": "open",

                "user_agent": request.META["HTTP_USER_AGENT"],
                "subject": subject,
                "message": message
            }
        }

        support_queue = self.get_support_queue(tracker)
        if support_queue is not None:
            if type(support_queue) == int:
                values["ticket"]["support_queue_id"] = support_queue
            else:
                values["ticket"]["support_queue"] = support_queue

        url = self.get_url()

        opener = urllib2.build_opener()

        body = json.dumps(values)

        r = urllib2.Request(url, body,
                            headers={"Content-Type": "application/json"})
        data = opener.open(r)
        data = json.load(data)

        return data