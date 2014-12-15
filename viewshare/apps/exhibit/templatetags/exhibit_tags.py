from django import template
from viewshare.apps.exhibit import conf

register = template.Library()


@register.inclusion_tag("exhibit/exhibit_list_item.html", takes_context=True)
def exhibit_list_item(context, exhibit):
    request = context['request']
    user = request.user

    can_edit = user.has_perm("exhibit.can_edit", exhibit)
    can_delete = user.has_perm("exhibit.can_delete", exhibit)
    can_view = user.has_perm("exhibit.can_view", exhibit)
    can_inspect = user.has_perm("exhibit.can_inspect", exhibit)

    return {"exhibit": exhibit,
            "request": request,
            "can_edit": can_edit,
            "can_delete": can_delete,
            "can_view": can_view,
            "can_inspect": can_inspect}


@register.inclusion_tag("exhibit/exhibit_list.html", takes_context=True)
def exhibit_list(context, exhibits, max_count=10, pageable=True):
    return {"object_list": exhibits,
            "max_count": max_count,
            "pageable": pageable,
            "request": context['request'],
            "sort": context["request"].GET.get("sort", None),
            "dir": context["request"].GET.get("dir", "desc")}


@register.simple_tag
def simile_painter_url():
    return conf.SIMILE_PAINTER_SERVICE_URL
