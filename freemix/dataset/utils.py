from django.utils.translation import ugettext_lazy as _

from freemix.dataset.models import TX_STATUS


def pretty_print_transaction_status(status_id):
    """
    Return a description for a status given a 'status_id'
    """
    if status_id == TX_STATUS['pending']:
        status = _('Pending')
    elif status_id == TX_STATUS['scheduled']:
        status = _('Scheduled')
    elif status_id == TX_STATUS['running']:
        status = _('Running')
    elif status_id == TX_STATUS['success']:
        status = _('Successful')
    elif status_id == TX_STATUS['cancelled']:
        status = _('Cancelled')
    else:
        status = _('Unknown')

    return status

