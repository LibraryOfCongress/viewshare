Installing and Configuring Recollection
=======================================

Linux based Installation
------------------------

Requires:

   * Python 2.6.x
   * virtualenv 1.4.3+ (easy_install2.6 virtualenv)
   * Linux derivative (e.g. Ubuntu)
   * Web server (e.g. Apache 2.2 - optional)
   * Database (Postgres, MySQL, Oracle - optional)

To build::

   $ virtualenv --no-site-packages --distribute recollection
   $ cd recollection
   $ source bin/activate
   $ pip install git+git://loc-recollect.git.sourceforge.net/gitroot/loc-recollect/loc-recollect#egg=recollection
   $ pip install -r src/recollection/requirements/develop.txt

The "example_project" directory provides the starting point for the
initial configuration
of a Recollection site.  As with all Django applications, be sure to
pick your own secret
for the SECRET_KEY setting in settings.py.

Database
--------

If you wish to use a database other than the default SQLite, modify
the DATABASES section of
the settings.py file to point to an empty database you've already
created, including the host
on which the database server resides, and the user credentials.

Then create the database::

   $ cd src/freemix/freemix/
   $ ./manage.py syncdb --noinput
   $ ./manage.py migrate
   $ ./manage.py createsuperuser

And load the default data::

   $ ./manage.py loaddata exhibit_themes
   $ ./manage.py loaddata canvases

At this point, you can run the site using the included lightweight Web server::

   $ ./manage.py runserver

But as that Web server isn't recommended for production sites, you
should consult the
directions for using an alternate Web server:

* Apache_
* `other FastCGI-supporting Web servers`_

Site Settings
-------------

The following settings should be customized on a per-site basis:

* SITE_NAME: the name of the site, e.g. "My Recollection"
* SITE_NAME_STATUS: a string identifying the status of the site, e.g. "BETA"
* CONTACT_EMAIL: an email address that users can use to contact the site owner
* DEFAULT_FROM_EMAIL: the email address from which all sent emails will originate
* FEEDBACKLINK: an URL to be used by the user to provide feedback
* SUPPORT_USER: the user name of the support user
* ANONYMOUS_USERNAME: the user name used by anonymous users, e.g. "guest"
* ACCOUNT_OPEN_SIGNUP: allow anybody to register for a new account
* ACCOUNT_REQUIRED_EMAIL: require email addresses for new accounts
* ACCOUNT_EMAIL_VERIFICATION: require an email address verification step for new accounts
* THEME_DIR_URL: the path to the theme directory, by default "themes/chili"
* THEME_FRAGMENT_URL: the path to the theme CSS, optional
* THEME_URL: the absolute URL of the theme CSS, optional

Transformation Server
---------------------

Most Recollection installations will need the use of an Akara_ instance for
providing data transformation and augmentation services.

To install Akara, perform the following steps::

   $ virtualenv --no-site-packages --distribute akara-recollection
   $ cd akara-recollection
   $ source bin/activate
   $ pip install html5lib httplib2 python-dateutil simplejson feedparser xlrd
   $ pip install hg+http://foundry.zepheira.com/hg/zenpub#egg=zen
   $ pip install git+http://github.com/zepheira/akara.git#egg=akara
   $ pip install git+http://github.com/zepheira/amara.git#egg=amara
   $ pip install git+http://github.com/zepheira/freemix-akara.git#egg=freemix-akara

Create an akara.conf file with these contents (making the path substitution for ConfigRoot)::

   class Akara:
       Listen = 8001
       ConfigRoot = "<path-of-akara-recollection-directory>"
       PidFile = "logs/akara.pid"
       ModuleDir = "modules"
       ModuleCache = "caches"
       MaxServers = 50
       MinSpareServers = 5
       MaxSpareServers = 10
       MaxRequestsPerServer = 1000
       ErrorLog = "logs/error.log"
       AccessLog = "logs/access.log"
       LogLevel = "INFO"

   MODULES = [
       "freemix_akara.load_data",
       "freemix_akara.augment_data",
       "freemix_akara.contentdm",
       "freemix_akara.oai",
   ]

   class augment_data:
       geonames_dbfile = Akara.ConfigRoot+'/caches/geonames.sqlite3'

   class load_data:
       magic_file_command="file -i -"
       dataload_diagnostics=(not 0)

Install the geo database used by the augmentation service::

   $ mkdir caches
   $ cd caches
   $ wget -O caches/geonames.sqlite3 http://dl.dropbox.com/u/19247598/Akara/geonames.sqlite3

Then initialize and run Akara::

   $ akara -f akara.conf setup
   $ akara -f akara.conf start

You can now point your Recollection installation at this Akara service using
the AKARA_URL_PREFIX configuration option in settings.py. For example::

   AKARA_URL_PREFIX = 'http://transformer.example.com:8001'

Other Configuration Options
---------------------------

Redmine
^^^^^^^

If integrating with Redmine_, you will need to specify these options
in settings.py:

   * REDMINE_URL: the root URL of the Redmine site
   * REDMINE_USER/REDMINE_PASSWORD: optional HTTP credentials for the Redmine site
   * REDMINE_USER_ID: the Redmine user id to use
   * REDMINE_KEY: the API key for the Redmine site
   * REDMINE_PROJECT_ID: the id of the project to use

Uservoice
^^^^^^^^^

Add the following section to settings.py to configure the use of a
Uservoice_ feedback tab::

   USERVOICE_SETTINGS = {
      'API_KEY': '<your-api-key>',
      'ACCOUNT_KEY': '<your-account-key>',
   }

You can find your keys in the Uservoice control panel.

The FEEDBACKLINK setting, described above, can also be set to the URL
of a Uservoice forum.

Email
^^^^^

These options can be used to configure email delivery and operation:

   * EMAIL_CONFIRMATION_DAYS: the number of days to await email confirmation from a user
   * EMAIL_DEBUG: if True, log debugging information about email activity
   * EMAIL_HOST/EMAIL_PORT: the host name and port of the email server
   * EMAIL_HOST_USER/EMAIL_HOST_PASSWORD: credentials for the email server
   * EMAIL_USE_TLS: whether to support TLS connections

.. _Akara: http://akara.info
.. _Apache: https://docs.djangoproject.com/en/1.3/howto/deployment/modwsgi/
.. _other FastCGI-supporting Web servers: https://docs.djangoproject.com/en/1.3/howto/deployment/fastcgi/
.. _Uservoice: http://www.uservoice.com
.. _Redmine: http://www.redmine.org

