from django import template
from viewshare.apps.upload.views import DataSourceRegistry

register = template.Library()

@register.inclusion_tag("upload/datasource_list_item.html", takes_context=True)
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
