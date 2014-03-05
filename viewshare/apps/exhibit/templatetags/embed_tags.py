from django import template

from django.contrib.staticfiles.storage import staticfiles_storage
from require.conf import settings as require_settings
from require.helpers import resolve_require_module, resolve_require_url
from viewshare.utilities import get_site_url


register = template.Library()

@register.simple_tag
def built_module(module):
    return staticfiles_storage.url(resolve_require_module(require_settings.REQUIRE_STANDALONE_MODULES[module]["out"]))

@register.simple_tag
def require_module(module):
    """
    Generates a dumped dictionary representation of a require module appropriate for
    embedding in a javascript template

    If the module is configured in REQUIRE_STANDALONE_MODULES, and REQUIRE_DEBUG is False, then
    then the standalone built version of the module will be loaded instead, bypassing require.js
    for extra load performance.

    This is adapted from the corresponding template tag in django-require, which is available
    under the following license:

        Copyright (c) 2009, David Hall.
        All rights reserved.

        Redistribution and use in source and binary forms, with or without modification,
        are permitted provided that the following conditions are met:

            1. Redistributions of source code must retain the above copyright notice,
               this list of conditions and the following disclaimer.

            2. Redistributions in binary form must reproduce the above copyright
               notice, this list of conditions and the following disclaimer in the
               documentation and/or other materials provided with the distribution.

            3. Neither the name of David Hall nor the names of its contributors may be
               used to endorse or promote products derived from this software without
               specific prior written permission.

        THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
        ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
        WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
        DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
        ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
        (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
        LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
        ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
        (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
        SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    """
    if not require_settings.REQUIRE_DEBUG and module in require_settings.REQUIRE_STANDALONE_MODULES:
        return """{{src: '{module}' }}""".format(
            module = get_site_url(staticfiles_storage.url(resolve_require_module(require_settings.REQUIRE_STANDALONE_MODULES[module]["out"]))),
        )
    return """{{src: '{src}', "data-main": '{module}' }}""".format(
        src = get_site_url(staticfiles_storage.url(resolve_require_url(require_settings.REQUIRE_JS))),
        module = get_site_url(staticfiles_storage.url(resolve_require_module(module))),
    )