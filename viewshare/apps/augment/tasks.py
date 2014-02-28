from celery.task import task


@task
def augment_property(tx_id):
    """
    Runs an augmentation on a particular property
    """
    from .models import AugmentTransaction
    # TODO: get the correct AugmentTransaction
    tx = AugmentTransaction.objects.get(tx_id=tx_id)
    tx.run()
