from django import template
from viewshare.apps.vendor.friends.models import Friendship
from freemix.permissions import PermissionsRegistry


register = template.Library()

@register.inclusion_tag("connections/connection_list.html", takes_context=True)
def connection_list_by_user(context, user, max_count=10, pageable=True):
    return {"queryset": Friendship.objects.friends_for_user(user=user), "max_count": max_count, "pageable": pageable,
            "request": context['request']}

@register.inclusion_tag("connections/connection_list.html", takes_context=True)
def connection_list(context, queryset, max_count=10, pageable=True):
    return {"queryset": queryset, "max_count": max_count, "pageable": pageable,
            "request": context['request']}


@register.inclusion_tag("profiles/user_counts.html", takes_context=True)
def user_counts(context, target_user):
    request = context["request"]
    exhibit_count = target_user.exhibits.filter(PermissionsRegistry.get_filter("exhibit.can_view", request.user)).count()
    dataset_count = target_user.datasets.filter(PermissionsRegistry.get_filter("dataset.can_view", request.user)).count()

    return {
        "target_user": target_user,
        "exhibit_count": exhibit_count,
        "dataset_count": dataset_count
    }

