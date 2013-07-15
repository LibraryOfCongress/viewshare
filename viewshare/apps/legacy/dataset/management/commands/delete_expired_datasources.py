import logging

from django.core.management.base import NoArgsCommand

from viewshare.apps.legacy.dataset.models import DataSource


class Command(NoArgsCommand):
    help = ("Delete DataSource records that have a modified "
            " date older than the expiration time and no"
            " associated dataset")

    def handle_noargs(self, **options):
        logging.basicConfig(level=logging.DEBUG, format="%(message)s")
        logging.debug("Deleting expired "
                      "freemix.dataset.models.DataSource models")
        transactions = DataSource.objects.all()
        expired_transactions = [x for x in transactions if x.is_expired()]
        record_count = len(expired_transactions)
        for expired in expired_transactions:
            expired.delete()
        logging.debug("Deleted %s DataSource records" % record_count)
