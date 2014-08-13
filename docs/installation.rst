Installing and Configuring Viewshare
====================================

Linux based Installation
------------------------

Requires:

   * Python 2.7.x
   * virtualenv
   * Linux derivative (e.g. Ubuntu)
   * Web server (e.g. Apache 2.2 - optional)
   * Database (Postgres, MySQL, Oracle - optional)

To build::

   $ virtualenv viewshare
   $ cd viewshare
   $ source bin/activate
   $ pip install -e git+https://github.com/LibraryOfCongress/viewshare.git#egg=viewshare
   $ pip install -r src/viewshare/requirements/requirements.txt

The "example_project" directory provides the starting point for the
initial configuration
of a Viewshare site.  As with all Django applications, be sure to
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

   $ cd src/viewshare
   $ ./manage.py syncdb --noinput
   $ ./manage.py migrate
   $ ./manage.py createsuperuser


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

* SITE_NAME: the name of the site, e.g. "My Viewshare"
* SITE_NAME_STATUS: a string identifying the status of the site, e.g. "BETA"
* CONTACT_EMAIL: an email address that users can use to contact the site owner
* DEFAULT_FROM_EMAIL: the email address from which all sent emails will originate
* FEEDBACKLINK: an URL to be used by the user to provide feedback
* SUPPORT_USER: the user name of the support user
* ANONYMOUS_USERNAME: the user name used by anonymous users, e.g. "guest"
* ACCOUNT_REQUIRED_EMAIL: require email addresses for new accounts
* ACCOUNT_EMAIL_VERIFICATION: require an email address verification step for new accounts
* OMNITURE_TRACKING: Set to True to enable the LOC omniture tracking script

Transformation Server
---------------------

Most Viewshare installations will need the use of an Akara_ instance for
providing data transformation and augmentation services.

To install Akara, perform the following steps::

   $ virtualenv akara-viewshare
   $ cd akara-viewshare
   $ source bin/activate
   $ pip install -r https://raw.githubusercontent.com/zepheira/freemix-akara/master/requirements.txt

Create an akara.conf file with these contents (making the path substitution for ConfigRoot)::

   class Akara:
       Listen = 8001
       ConfigRoot = "<path-of-akara-viewshare-directory>"
       PidFile = "logs/akara.pid"
       ModuleDir = "modules"
       ModuleCache = "caches"
       MaxServers           =   150
       MinSpareServers      =   5
       MaxSpareServers      =   10
       MaxRequestsPerServer =   10
       ErrorLog = "logs/error.log"
       AccessLog = "logs/access.log"
       LogLevel = "INFO"

   MODULES = [
       "akara.demo.cache_proxy",
       "zen.akamod.geocoding",
       "freemix_akara.load_data",
       "freemix_akara.augment_data",
       "freemix_akara.contentdm",
       "freemix_akara.oai",
   ]

   class geocoding:

       # Comment out the following line for direct geonames
       geocoder = 'http://purl.org/com/zepheira/services/geocoders/local-geonames'

       ## Uncomment the following two lines for direct geonames,
       ## substituting a geonames.org username
       # geocoder = 'http://purl.org/com/zepheira/services/geocoders/geonames-service'
       # geonames_service_user = '<geonames username>'

       geonames_dbfile = Akara.ConfigRoot+'/caches/geonames.sqlite3'

       cache_max_age = 86400

   class load_data:
       magic_file_command="file -i -"
       dataload_diagnostics=(not 0)

   class cache_proxy:
       maxlen = { None: 8*24*3600, }

Install the geo cache used by the augmentation service::

   $ mkdir caches
   $ cd caches
   $ wget -O caches/geonames.sqlite3 http://dl.dropbox.com/u/19247598/Akara/geonames.sqlite3


Then initialize and run Akara::

   $ akara -f akara.conf setup
   $ akara -f akara.conf start

You can now point your Viewshare installation at this Akara service using
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
      'SSO_KEY': '<your-api-key>',
      'ACCOUNT_KEY': '<your-account-key>',
      'FORUM': '<forum-id>',               # default: 1
      'HOST': '<uservoice-host>',          # default: recollection.uservoice.com
   }

You can find your keys in the Uservoice control panel.

If you wish to do any customization of the Uservoice tab, override the `profiles/uservoice_options` template.


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

