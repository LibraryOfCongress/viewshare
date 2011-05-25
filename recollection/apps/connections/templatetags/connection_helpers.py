from django import template
from django.conf import settings
from django.template.loader import render_to_string
from django.template import Variable
from friends.models import Friendship


register = template.Library()

@register.inclusion_tag("connections/connection_list.html", takes_context=True)
def connection_list_by_user(context, user, max_count=10, pageable=True):
    return {"queryset": Friendship.objects.friends_for_user(user=user), "max_count": max_count, "pageable": pageable,
            "request": context['request']}

@register.inclusion_tag("connections/connection_list.html", takes_context=True)
def connection_list(context, queryset, max_count=10, pageable=True):
    return {"queryset": queryset, "max_count": max_count, "pageable": pageable,
            "request": context['request']}

