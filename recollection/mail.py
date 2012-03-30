from django.conf import settings

def import_mailer():
    if not settings.DEBUG:
        try:
            from mailer import send_mail as mailer_send_mail
            return mailer_send_mail
        except:
            pass
    from django.core.mail import send_mail
    return send_mail

send_mail = import_mailer()