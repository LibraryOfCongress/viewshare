from django import template
from freemix.permissions import PermissionsRegistry


register = template.Library()

@register.inclusion_tag("dataset/dataset_list_item.html", takes_context=True)
def dataset_list_item(context, dataset):
    request = context["request"]
    user = request.user

    can_edit = user.has_perm("dataset.can_edit", dataset)
    can_delete = user.has_perm("dataset.can_delete", dataset)
    can_view = user.has_perm("dataset.can_view", dataset)
    can_inspect = user.has_perm("dataset.can_inspect", dataset)

    can_build = user.has_perm("dataset.can_build", dataset)

    return {"dataset": dataset,
            "dataset_url": dataset.get_absolute_url(),
            "exhibits": dataset.exhibits.filter(PermissionsRegistry.get_filter("exhibit.can_view", user)),
            "request": request,
            "can_view": can_view,
            "can_edit": can_edit,
            "can_delete": can_delete,
            "can_build": can_build,
            "can_inspect": can_inspect
            }



@register.inclusion_tag("dataset/dataset_list.html", takes_context=True)
def dataset_list(context, datasets, max_count=10, pageable=True):
    return {"object_list": datasets, "max_count": max_count, "pageable": pageable,
            "request": context['request']}
