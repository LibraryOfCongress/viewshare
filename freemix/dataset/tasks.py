from celery import task
from celery.task import periodic_task
from celery.task.schedules import crontab
from django.core.management import call_command

from freemix.dataset.models import DataSourceTransaction


@task
def run_transaction(transaction_id):
    """
    Handles creating a DataSourceTransaction for a valid DataSource. Reports
    updates to dataset.views.DataSourceTransactionView.
    """
    tx = DataSourceTransaction.objects.get(id=transaction_id)
    tx.run()
    return tx


@periodic_task(run_every=crontab(hour='*/4'))
def delete_expired_transactions():
    """
    Delete DataSourceTransaction records that have a modified
    date older than the expiration time
    """
    call_command('delete_expired_transactions')


@periodic_task(run_every=crontab(hour='*/4'))
def delete_expired_datasources():
    """
    Delete DataSource records that have a modified
    date older than the expiration time and have no
    associated dataset
    """
    call_command('delete_expired_datasources')