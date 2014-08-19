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
* announcements
    * Make site-wide announcements
    * https://github.com/brosner/django-announcements
* compressor
    * Compresses linked and inline javascript or CSS into a single cached file.
    * https://github.com/jezdez/django_compressor
* django_extensions
    * global custom management extensions
    * https://github.com/django-extensions/django-extensions
* django_sorting
    * Display sortable data
    * https://github.com/directeur/django-sorting
    * NOTE: Is this being used by users? I see examples of the {% anchor %} templatetag in the templates but don't see these templates on the site
* friends
    * Friendship, contact and invitation management
    * https://github.com/jtauber/django-friends
    * candidate for elimination
* notification
    * user notification management
    * https://github.com/jtauber/django-notification
* pagination
    * Break lists into paged results
    * https://github.com/ericflo/django-pagination
* registration
    * user registration application
    * https://bitbucket.org/ubernostrum/django-registration
* south
    * Provides schema and data migrations
    * https://bitbucket.org/andrewgodwin/south/
* django-crispy-forms
    * Build programmatic reusable layouts out of components, having full control of the rendered HTML
    * http://django-crispy-forms.readthedocs.org/en/latest/

Custom apps
-----------
* Freemix specific
    * freemix
    * viewshare.apps.legacy.dataset
        * A DataSet can be thought of as a group of information related to uploaded data. A DataSet contains information about:
            * The raw data that was uploaded to Viewshare
            * Descriptions of the columns in uploaded data
            * Type of data (CSV file, MODS file, etc.)
            * Descriptions of the data properties which are compatible with exhibit and used to visualize the DataSet through SIMILE's Exhibit
    * viewshare.apps.augment
        * Stores and provides augmentation patterns for dataset cells. For example, a DataSet data cell may contain a list of values separated by a comma. This app provides a pattern that recognizes comma separated data and parses it accordingly.
    * freemix.exhibit
        * An Exhibit is a visualization of a DataSet.
    * viewshare.apps.share
        * Allows an Exhibit owner to generate a unique obfuscated URL for their Exhibit.

* Viewshare specific
    * viewshare.apps.notices
        * User can control email settings for system events like invitations and announcements.
    * viewshare.utilities
        * This is a general, catch-all app to store utilities used throughout the system. Some of the code includes:
            * context processors to add settings values to a ''RequestContext''.
            * template tags to display viewshare and akara versions.
    * viewshare.apps.connections
        * Allows a user to create and accept invitations from other users.
        * This app is a facade over the third-party 'friends' app
    * viewshare.conf.viewshare_defaults
        * This 'app' only exists to contain South migrations that are used in system configuration tasks like loading data for augmentation errors.
    * viewshare.apps.support
        * A system for reporting system errors like data upload and augmentation issues
    * viewshare.apps.account
        * Stores timezone and language information about a user. Also, handles password resets.
    * viewshare.apps.profiles
        * Stores information about a user such as: bio, website, location, and organization.
    * viewshare.apps.discover
        * Allows an admin to create a collection of Exhibits for the purposes of display. Also includes a front-end slideshow utilized on the homepage.

* ViewShare specific
    * viewshare.upload
        * Tracks the files or URLs involved in a DataSet upload. File types include Mods file/URL, OAI URL, CSV file/URL, or ContentDM URL.
    * viewshare.moderated_registration
        * A user must request an account before they can begin using the system. This app moderates the queue of people requesting user accounts. Accounts are granted or denied depending on an admin's choice.
