import logging
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import render

logger = logging.getLogger(__name__)


class BaseSupportBackend(object):
    """
    A generic base class for support backend implementation
    """

    response_template = "support/issue_response.html"

    def create_issue(self, request, subject, message, tracker="default"):
        """
        Creates a new support issue

        :param subject: A short summary of the issue
        :param message: A full description of the issue
        :param tracker: A string allowing for categorization of issues by type
        :return: The appropriate template context for rendering
                 the response to issue creation.  This will be
                 passed to `render_issue_response`
        """
        raise NotImplementedError

    def render_issue_response(self, request, context):
        """
        Renders and returns the response to an issue request based on a
        provided template context
        """
        return render(request, self.response_template, context)


class LoggerSupportBackend(BaseSupportBackend):
    """
    A Support backend that simply logs the request
    """
    def create_issue(self, request, subject, message, tracker="default"):
        logger.info("-------------------------------------------")
        logger.info("Support Request for tracker %s:" % tracker)
        logger.info(subject)
        logger.info("\n")
        logger.info(message)
        logger.info("-------------------------------------------")
        return {}


class EmailSupportBackend(BaseSupportBackend):
    """
    A Support backend that emails the request to the administrators
    """
    def create_issue(self, request, subject, message, tracker="default"):
        address = getattr(settings, "SUPPORT_EMAIL", settings.CONTACT_EMAIL)

        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [address])

        logger.debug("-------------------------------------------")
        logger.debug("Emailed support Request for tracker %s:" % tracker)
        logger.debug(subject)
        logger.debug("\n")
        logger.debug(message)
        logger.debug("-------------------------------------------")
        return {}


def get_support_backend():
    """
    Generates and caches a support backend based on the
    global `SUPPORT_BACKEND` setting

    :return: An instance of the configured support backend
    """
    if not hasattr(get_support_backend, "__backend__"):
        class_str = getattr(settings, "SUPPORT_BACKEND", None)
        if class_str:
            module_name, class_name = class_str.rsplit(".", 1)
            try:
                module = __import__(module_name)
                submodules = module_name.split('.')[1:]
                for submodule in submodules:
                    module = getattr(module, submodule)
                cl = getattr(module, class_name)
                get_support_backend.__backend__ = cl()
            except (ImportError, AttributeError), ex:
                logger.error("Support Backend Improperly "
                             "Configured: No %s" % class_name)
                logger.error(ex)
                get_support_backend.__backend__ = LoggerSupportBackend()
        else:
            get_support_backend.__backend__ = LoggerSupportBackend()
    return get_support_backend.__backend__
