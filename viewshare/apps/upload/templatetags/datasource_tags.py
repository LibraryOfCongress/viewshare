from django import template
from viewshare.apps.upload.views import DataSourceRegistry

register = template.Library()


@register.inclusion_tag("dataset/datasource_list.html", takes_context=True)
def datasource_list(context, sources, max_count=10, pageable=True):
    return {
            "object_list": sources,
            "max_count": max_count,
            "pageable": pageable,
            "request": context['request'],
            "sort": context["request"].GET.get("sort", None),
            "dir": context["request"].GET.get("dir", "desc"),
            }


@register.inclusion_tag("dataset/datasource_list_item.html", takes_context=True)
def datasource_list_item(context, datasource):
    request = context["request"]
    user = request.user

    can_edit = user.has_perm("datasource.can_edit", datasource)
    can_delete = user.has_perm("datasource.can_delete", datasource)
    can_view = user.has_perm("datasource.can_view", datasource)

    template = DataSourceRegistry.get_detail_template(datasource.get_concrete())
    return {"template_name": template,
            "datasource": datasource,
#            "datasource_url": datasource.get_absolute_url(),
            "request": request,
            "can_view": can_view,
            "can_edit": can_edit,
            "can_delete": can_delete
            }
