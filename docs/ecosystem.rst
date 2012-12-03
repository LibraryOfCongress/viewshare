List of applications within a Viewshare installation
====================================================

Django Core
-----------
* django.contrib.staticfiles
* django.contrib.auth
* django.contrib.contenttypes
* django.contrib.sessions
* django.contrib.sites
* django.contrib.humanize
* django.contrib.markup
* django.contrib.admin

Third-party Apps
----------------
* CMS Apps
    * cms
    * mptt
    * menus
    * sekizai
    * reversion
    * cms.plugins.text
    * cms.plugins.picture
    * cms.plugins.link
    * cms.plugins.file
    * cms.plugins.snippet
* compressor
    * Compresses linked and inline javascript or CSS into a single cached file.
    * https://github.com/jezdez/django_compressor
* south
    * Provides schema and data migrations
    * https://bitbucket.org/andrewgodwin/south/
* piston
    * A framework for creating RESTful APIs
    * https://bitbucket.org/jespern/django-piston/wiki/Home
* notification
    * user notification management
    * https://github.com/jtauber/django-notification 
* emailconfirmation
    * Confirms that email addresses associated with user accounts are valid
    * https://github.com/jtauber/django-email-confirmation
* django_extensions
    * global custom management extensions
    * https://github.com/django-extensions/django-extensions
* robots
    * Manages robots.txt files
    * https://github.com/jezdez/django-robots
* friends
    * Friendship, contact and invitation management
    * https://github.com/jtauber/django-friends
    * NOTE: Is this being used by users?
* mailer
    * Queues and sends email
    * https://github.com/jtauber/django-mailer
* announcements
    * Make site-wide announcements
    * https://github.com/brosner/django-announcements
    * NOTE: Is this being used in in the code?
* pagination
    * Break lists into paged results
    * https://github.com/ericflo/django-pagination
* timezones
    * Deal with timezone localization for users
    * https://github.com/brosner/django-timezones
* ajax_validation
    * preform ajax validation on django forms
    * https://github.com/alex/django-ajax-validation
    * NOTE: Is this being used in the code?
* uni_form
    * Build programmatic reusable layouts out of components, having full control of the rendered HTML
    * https://github.com/pydanny/django-uni-form
    * NOTE: uni_form is deprecated for django-crispy-forms
* django_sorting
    * Display sortable data
    * https://github.com/directeur/django-sorting
    * NOTE: Is this being used by users? I see examples of the {% anchor %} templatetag in the templates but don't see these templates on the site
* registration
    * user registration application
    * https://bitbucket.org/ubernostrum/django-registration

Custom apps
-----------
* Freemix specific
    * freemix
    * freemix.dataset
    * freemix.exhibit
    * freemix.dataset.augment
    * freemix.exhibit.share

* Recollection specific
    * recollection.apps.notices
    * recollection.apps.site_theme
    * recollection.apps.collection_catalog
    * recollection.utils
    * recollection.apps.connections
    * recollection.conf.recollection_defaults
    * recollection.apps.support
    * recollection.apps.account
    * recollection.apps.profiles
    * recollection.apps.discover

* ViewShare specific
    * viewshare.upload
    * viewshare.moderated_registration
