from django import template
from django.utils.translation import ugettext_lazy as _

from freemix.dataset.models import TX_STATUS

register = template.Library()


@register.inclusion_tag(
    'dataset/datasource_transaction_list_item.html',
    takes_context=True)
def datasource_transaction_list_item(context, datasource_transaction):
    """
    Display details for a DataSourceTransaction model
    """
    datasource_transaction_url = datasource_transaction.get_absolute_url()
    status = datasource_transaction.status
    if status == TX_STATUS['pending']:
        status = _('Pending')
    elif status == TX_STATUS['scheduled']:
        status = _('Scheduled')
    elif status == TX_STATUS['running']:
        status = _('Running')
    elif status == TX_STATUS['success']:
        status = _('Successful')
    elif status == TX_STATUS['cancelled']:
        status = _('Cancelled')
    else:
        status = _('Unknown')

    return {'datasource_transaction': datasource_transaction,
            'datasource_transaction_url': datasource_transaction_url,
            'status': status}


@register.inclusion_tag(
    'dataset/datasource_transaction_list.html',
    takes_context=True)
def datasource_transaction_list(context, datasource_transactions):
    """
    Display list of given "datasource_transactions"
    """
    return {'object_list': datasource_transactions}
