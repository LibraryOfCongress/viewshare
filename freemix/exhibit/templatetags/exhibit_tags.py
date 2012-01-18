from django import template
from django.conf import settings
from django.template.loader import render_to_string
from freemix.exhibit import models

register = template.Library()


@register.inclusion_tag("exhibit/exhibit_list_item.html", takes_context=True)
def exhibit_list_item(context, exhibit):
    request = context['request']
    visible = exhibit.dataset_available(request.user)
    user = request.user

    can_edit = user.has_perm("exhibit.can_edit", exhibit)
    can_delete = user.has_perm("exhibit.can_delete", exhibit)
    can_view = user.has_perm("exhibit.can_view", exhibit)
    can_inspect = user.has_perm("exhibit.can_inspect", exhibit)

    return {"exhibit": exhibit, 
            "request": request,
            "visible": visible,
            "dataset_available": visible,
            "can_edit": can_edit,
            "can_delete": can_delete,
            "can_view": can_view,
            "can_inspect": can_inspect}

@register.inclusion_tag("exhibit/exhibit_list.html", takes_context=True)
def exhibit_list(context, exhibits, max_count=10, pageable=True):
    return {"object_list": exhibits, "max_count": max_count, "pageable": pageable,
            "request": context['request']}

@register.inclusion_tag("exhibit/exhibit_create_dialog.html", takes_context=True)
def new_exhibit(context):
    return {'STATIC_URL': settings.STATIC_URL}

# Theme tags
@register.tag
def theme_list(parser, token):
    return ThemeListNode("exhibit/theme_list.html" )

class ThemeListNode( template.Node ):
    def __init__ (self, template):
        self.template = template

    def render(self, context):
        return render_to_string(self.template, {"theme_list": models.Theme.objects.filter(enabled=True)})
