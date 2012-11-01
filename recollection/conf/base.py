from os import path
from posixpath import join as url_join
from imp import find_module

import recollection.migrations
SOUTH_MIGRATION_MODULES = recollection.migrations.SOUTH_MIGRATION_MODULES

module_path = lambda m: path.abspath(find_module(m)[1])

MEDIA_ROOT = path.join(module_path("recollection"), "site_media", "media")
MEDIA_URL = '/media/'

STATIC_ROOT = path.join(module_path("recollection"), "site_media", 'static')
STATIC_URL = '/static/'

COMPRESS_ROOT = STATIC_ROOT
COMPRESS_URL = STATIC_URL

CMS_MEDIA_ROOT = path.join(STATIC_ROOT, 'cms/')
CMS_MEDIA_URL = path.join(STATIC_URL, 'cms/')

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = url_join(STATIC_URL, "admin/")

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'changeme'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'pagination.middleware.PaginationMiddleware',
    'django.middleware.transaction.TransactionMiddleware',
    'reversion.middleware.RevisionMiddleware',
    'cms.middleware.page.CurrentPageMiddleware',
    'cms.middleware.user.CurrentUserMiddleware',
    'cms.middleware.toolbar.ToolbarMiddleware',

)


ROOT_URLCONF = 'recollection.urls'

AUTHENTICATION_BACKENDS  = (
    'freemix.permissions.RegistryBackend',
    'django.contrib.auth.backends.ModelBackend',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.request",
    "django.core.context_processors.static",
    "recollection.utils.context_processors.recollection_settings",
    "notification.context_processors.notification",
    "announcements.context_processors.site_wide_announcements",
    "recollection.apps.account.context_processors.account",
    #"messages.context_processors.inbox",
    "recollection.apps.connections.context_processors.invitations",
    "cms.context_processors.media",
    'sekizai.context_processors.sekizai',

)

INSTALLED_APPS = (
    'django.contrib.staticfiles',
    # included
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.humanize',
    'django.contrib.markup',
    'django.contrib.admin',


    # external
    'notification',
    'emailconfirmation',
    'django_extensions',
    'robots',
    'friends',
    'mailer',
    'announcements',
    'pagination',
    'timezones',
    'ajax_validation',
    'uni_form',
    'django_sorting',

    'recollection.apps.account',
    'recollection.apps.profiles',

    'compressor',
    'south',
    #'piston',

    # CMS stuff
    'cms',
    'mptt',
    'menus',
    'sekizai',
    'reversion',
    'cms.plugins.text',
    'cms.plugins.picture',
    'cms.plugins.link',
    'cms.plugins.file',
    'cms.plugins.snippet',

    # Freemix specific
    'freemix',
    'freemix.dataset',
    'freemix.exhibit',
    'freemix.dataset.augment',
    'freemix.exhibit.share',

    # Recollection specific
    'recollection.apps.notices',
    'recollection.apps.site_theme',
    'recollection.apps.collection_catalog',
    'recollection.utils',
    'recollection.apps.connections',
    'recollection.conf.recollection_defaults',
    'viewshare.upload',

    # Support pipeline
    'recollection.apps.support',

    # Site registration
    'registration',
    'viewshare.moderated_registration',

    # ViewShare specific
    'recollection.apps.discover',
    )

STATICFILES_DIRS = (
    ('', path.join(module_path('viewshare'), 'static')),

    ('', path.join(module_path('recollection'), 'static')),
    ('', path.join(module_path('ajax_validation'), 'media')),
    ('', path.join(module_path('django_extensions'), 'media')),
)

ABSOLUTE_URL_OVERRIDES = {
    "auth.user": lambda o: "/profiles/profile/%s/" % o.username,
}
AUTH_PROFILE_MODULE = 'profiles.Profile'
NOTIFICATION_LANGUAGE_MODULE = 'account.Account'

THEME_DIR_URL = "themes/chili"
THEME_FRAGMENT_URL = "%s/chili.css"%THEME_DIR_URL
THEME_URL = '%s%s'%(STATIC_URL,THEME_FRAGMENT_URL)

TEMPLATE_DIRS = (
    path.join(module_path("viewshare"), "templates"),
    path.join(module_path("recollection"), "templates"),
    )

# Set to describe the site, properties and the names

SITE_NAME = "Recollection"
SITE_NAME_STATUS = "BETA"
CONTACT_EMAIL = "noreply@example.com"
FEEDBACKLINK = "mailto:recollection@lists.zepheira.com"

LOGIN_URL = "/account/login"
LOGIN_REDIRECT_URLNAME = "user_home"

ANONYMOUS_USERNAME='guest'

ACCOUNT_REQUIRED_EMAIL = False
ACCOUNT_EMAIL_VERIFICATION = False

ACCOUNT_ACTIVATION_DAYS=14

FIXTURE_DIRS=(
    path.join(module_path("viewshare"), "fixtures"),
    path.join(module_path("recollection"), "fixtures"),
)

LOCALE_PATHS=(
    path.join(module_path("recollection"), "locale"),
)

# Javascript and CSS compression
COMPRESS_ENABLED = False

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

# django-cms
CMS_TEMPLATES = (
    ('template.html', 'Front Page Template'),
    ('about/template.html', 'About Page Template'),
)

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

import logging
logging.basicConfig(
    level = logging.DEBUG,
    format = '%(asctime)s %(levelname)s %(message)s',
)
