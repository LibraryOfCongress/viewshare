from django import template
from django.conf import settings
from freemix.dataset.augment.models import ListPattern
from django.template.loader import render_to_string
from django.template import Variable

register = template.Library()

@register.inclusion_tag("freemix/augment/dialogs.html", takes_context=True)
def augment_dialogs(context):
    return {"patterns": ListPattern.objects.all() , "request":
            context['request'], "STATIC_URL": context["STATIC_URL"]}
