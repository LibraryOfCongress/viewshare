
from django.core.cache import cache
from django.shortcuts import  render
from django.http import  Http404, HttpResponseRedirect
from django.conf import settings
from django.template.response import TemplateResponse

from django.utils import simplejson

from Crypto.Cipher import AES


import base64
import hashlib
import urllib
import operator
import array
import time
from datetime import datetime
from recollection.apps.account.forms import LoginForm
from recollection.apps.account.utils import get_default_redirect


def uservoice_token(request, api_key, account_key):
    """
    Calculates and caches a UserVoice SSO token based on an
    authenticated user.
    """
    cache_key = "uservoice_sso_%s" % request.session.session_key
    sso_token = cache.get(cache_key)
    if sso_token is None:
        # Calc expiry time. UV needs it in GMT
        dt = time.mktime(request.session.get_expiry_date().timetuple())
        utc_dt = datetime.fromtimestamp(dt)
        expires = utc_dt.strftime("%Y-%m-%d %H:%M:%S")

        sso_data = {
            'guid': request.user.username,
            'expires': expires,
            'display_name': request.user.username,
            'admin': 'accept' if request.user.is_staff else 'deny',
        }
        email = request.user.email
        if email:
            sso_data["email"] = email
        block_size = 16
        mode = AES.MODE_CBC

        iv = "OpenSSL for Ruby"

        json = simplejson.dumps(sso_data, separators=(',', ':',))

        salted = api_key + account_key

        saltedHash = hashlib.sha1(salted).digest()[:16]

        json_bytes = array.array('b', json[0: len(json)])
        iv_bytes = array.array('b', iv[0: len(iv)])

        # # xor the iv into the first 16 bytes.
        for i in range(0, 16):
            json_bytes[i] = operator.xor(json_bytes[i], iv_bytes[i])

        pad = block_size - len(json_bytes.tostring()) % block_size
        data = json_bytes.tostring() + pad * chr(pad)
        aes = AES.new(saltedHash, mode, iv)
        encrypted_bytes = aes.encrypt(data)

        sso_token = urllib.quote(base64.b64encode(encrypted_bytes))
        td = utc_dt - datetime.now()
        cache_expiry = td.days * 24 * 3600 + td.seconds
        cache.set(cache_key, sso_token, cache_expiry)
    return sso_token


def uservoice_options(request, **kwargs):
    """
    Return a UserVoice single-sign-on (SSO) token

    Code derived from http://developer.uservoice.com/docs/single-sign-on-how-to
    """
    s = getattr(settings, "USERVOICE_SETTINGS", None)
    if s is None:
        raise Http404

    api_key = s.get('API_KEY')

    if api_key is None:
        raise Http404

    ctx = {
        "api_key": s.get("API_KEY"),
        "forum": s.get("FORUM", 1),
        "key": s.get('ACCOUNT_KEY', "recollection"),
        "host": s.get("HOST", "recollection.uservoice.com")
    }

    if request.user.is_authenticated():
        ctx["token"] = uservoice_token(request,
            ctx.get("api_key"),
            ctx.get("key"))

    response = render(request,
        "uservoice/options.js",
        ctx,
        content_type="text/javascript")

    return response


def uservoice_redirect(request):
    success_url = "https://%s%s?sso=%s"
    path = urllib.unquote(request.GET.get("return", "/login_success"))

    s = getattr(settings, "USERVOICE_SETTINGS", None)
    if s is None:
        raise Http404
    host = s.get("HOST")

    token = uservoice_token(request,
        s.get("API_KEY"),
        s.get("ACCOUNT_KEY"))

    success_url = success_url % (host, path, token,)
    size = request.GET.get("uv_size", "window")

    if size == "window":
        return HttpResponseRedirect(success_url)
    return TemplateResponse(request,
        "uservoice/redirect.html", {"redirect_url": success_url})


def login(request,
          form_class=LoginForm,
          template_name="uservoice/login.html",
          success_url=None,
          url_required=False,
          extra_context=None):

    if request.method == "POST" and not url_required:
        form = form_class(request.POST)
        if form.login(request):
            return uservoice_redirect(request)
    else:
        form = form_class()
    ctx = {
        "form": form,
        "url_required": url_required,
    }
    return render(request, template_name, ctx)
