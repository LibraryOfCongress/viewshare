from celery.task import task


@task
def augment_property(id):
    """
    Runs an augmentation on a particular property
    """
    from .models import AugmentTransaction
    # TODO: get the correct AugmentTransaction
    tx = AugmentTransaction.objects.get(id=id)
    tx.run()
    return tx
