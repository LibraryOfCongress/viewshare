from django import template
from viewshare.apps.augment.models import ListPattern

register = template.Library()

@register.inclusion_tag("dataset/augment/dialogs.html", takes_context=True)
def augment_dialogs(context):
    return {"patterns": ListPattern.objects.all() , "request":
            context['request'], "STATIC_URL": context["STATIC_URL"]}
