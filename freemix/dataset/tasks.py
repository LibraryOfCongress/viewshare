from celery import task

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
