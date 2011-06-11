"Recollection Context Processors"


from django.conf import settings

"""
A generic function for generating context processors, and a processor
which adds media-specific settings to each ``RequestContext``.

This is a fork of https://bitbucket.org/ubernostrum/django-template-utils/
 to allow for undefined settings.
"""
def settings_processor(*settings_list):
    """
    Generates and returns a context processor function which will read
    the values of all the settings passed in and return them in each
    ``RequestContext`` in which it is applied.

    For example::

        my_settings_processor = settings_processor('INTERNAL_IPS', 'SITE_ID')

    ``my_settings_processor`` would then be a valid context processor
    which would return the values of the settings ``INTERNAL_IPS`` and
    ``SITE_ID`` in each ``RequestContext`` in which it was applied.

    """
    def _processor(request):
        settings_dict = {}
        for setting_name in settings_list:
            settings_dict[setting_name] = getattr(settings, setting_name, None)
        return settings_dict
    return _processor

#-----------------------------------------------------------------------------#

recollection_settings = settings_processor(
    'SITE_NAME_STATUS',
    'THEME_DIR_URL',
    'FEEDBACKLINK',
    'THEME_URL',
    'THEME_FRAGMENT_URL',
    'CONTACT_EMAIL',
    'SITE_NAME',
    'ACCOUNT_OPEN_SIGNUP',
    'USERVOICE_API_KEY'
)

from django.core.exceptions import ImproperlyConfigured


_inbox_count_sources = None

def inbox_count_sources():
    """
    Returns a list of functions defined in
    settings.COMBINED_INBOX_COUNT_SOURCES
    """
    global _inbox_count_sources
    if _inbox_count_sources is None:
        sources = []
        for path in settings.COMBINED_INBOX_COUNT_SOURCES:
            i = path.rfind('.')
            module, attr = path[:i], path[i+1:]
            try:
                mod = __import__(module, {}, {}, [attr])
            except ImportError, err:
                raise ImproperlyConfigured('Error importing request processor'
                        'module %s: "%s"' % (module, err))
            try:
                func = getattr(mod, attr)
            except AttributeError:
                raise ImproperlyConfigured('Module "%s" does not define a'
                    '"%s" callable request processor' % (module, attr))
            sources.append(func)
        _inbox_count_sources = tuple(sources)
    return _inbox_count_sources


def combined_inbox_count(request):
    """
    A context processor that uses other context processors defined in
    setting.COMBINED_INBOX_COUNT_SOURCES to return the combined number from
    arbitrary counter sources.
    """
    count = 0
    for func in inbox_count_sources():
        counts = func(request)
        if counts:
            for value in counts.itervalues():
                try:
                    count = count + int(value)
                except (TypeError, ValueError):
                    pass
    return {'combined_inbox_count': count, }


