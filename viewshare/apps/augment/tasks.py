from celery.task import task


@task
def transform_datasource(transaction_id):
    """
    Handles creating a DataSourceTransaction for a valid DataSource. Reports
    updates to dataset.views.DataSourceTransactionView.
    """
    from .models import AugmentTransaction
    # TODO: get the correct AugmentTransaction
    tx = AugmentTransaction.objects.get(tx_id=transaction_id)
    tx.run()
    return tx

