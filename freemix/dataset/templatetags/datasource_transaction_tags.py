from django import template
from django.core.urlresolvers import reverse

from freemix.dataset.utils import pretty_print_transaction_status

register = template.Library()


@register.inclusion_tag(
    'dataset/datasource_transaction_list_item.html', takes_context=True)
def datasource_transaction_list_item(context, datasource_transaction):
    """
    Display details for a DataSourceTransaction model
    """
    transaction_url = datasource_transaction.get_absolute_url()
    transaction_result_url = reverse(
            'datasource_transaction_status',
            kwargs={'tx_id': datasource_transaction.tx_id})
    status = pretty_print_transaction_status(datasource_transaction.status)

    return {'datasource_transaction': datasource_transaction,
            'datasource_transaction_url': transaction_url,
            'datasource_transaction_result_url': transaction_result_url,
            'status': status}


@register.inclusion_tag(
    'dataset/datasource_transaction_list.html', takes_context=True)
def datasource_transaction_list(
        context, datasource_transactions, max_count=None):
    """
    Display list of given "datasource_transactions"
    """
    if max_count:
        datasource_transactions = datasource_transactions[:max_count]
    return {'object_list': datasource_transactions}
