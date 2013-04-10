"Viewshare Context Processors"


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

viewshare_settings = settings_processor(
    'CONTACT_EMAIL',
    'SITE_NAME',
    'SITE_NAME_STATUS',
    'USERVOICE_SETTINGS'
)

