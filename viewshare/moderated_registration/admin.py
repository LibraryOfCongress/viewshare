from django.contrib import admin
from . import models
from django.conf import settings
from registration.admin import RegistrationAdmin
from django.utils.translation import ugettext_lazy as _


import csv
from django.http import HttpResponse
from registration.models import RegistrationProfile


class OrganizationTypeAdmin(admin.ModelAdmin):
    list_display=('value',)
    ordering=('value',)
admin.site.register(models.OrganizationType, OrganizationTypeAdmin)

def organization(obj):
    return obj.user.get_profile().organization
organization.short_description = _("Organization")

def org_type(obj):
    return obj.user.get_profile().org_type
org_type.short_description = _("Organization Type")

def org_state(obj):
    return obj.user.get_profile().location
org_state.short_description = _("Location")

def reason(obj):
    return obj.user.get_profile().about
reason.short_description = _("Reason for joining")

class ModeratedRegistrationAdmin(RegistrationAdmin):
    export_fields = ('user', 'is_approved', 'activation_key',organization, org_type, org_state, reason)
    list_display = list(export_fields)
    list_filter = ('is_approved', 'user__is_active')
    actions = ['approve_users', 'reject_users', 'export_as_csv']

    def get_actions(self, request):
        actions = super(ModeratedRegistrationAdmin, self).get_actions(request)
        for key in actions.iterkeys():
            if key not in self.actions:
                del actions[key]
        return actions

    def reject_users(self, request, queryset):

        for profile in queryset:
            if not profile.is_approved:
                profile.user.delete()
    reject_users.short_description = _("Reject Users")

    def approve_users(self, request, queryset):
        for profile in queryset:
            self.model.objects.approve_profile(profile)
    approve_users.short_description = _("Approve Users")

    def export_as_csv(self, request, queryset):
        """
        Generic csv export admin action.
        based on http://djangosnippets.org/snippets/1697/
        """
        fields  = self.export_fields
        field_names = []
        for field in fields:
            if hasattr(field, 'short_description'):
                field_names += [unicode(field.short_description)]
            else:
                field_names += [field]


        response = HttpResponse(mimetype='text/csv')
        response['Content-Disposition'] = 'attachment; filename=registration_profiles.csv'

        writer = csv.writer(response)
        writer.writerow(list(field_names))
        for obj in queryset:
            row = []
            for field in fields:
                if isinstance(field, basestring):
                    row += [unicode(getattr(obj, field))]
                else:
                    row +=[unicode(field(obj))]

            writer.writerow(row)
        return response
    export_as_csv.short_description = "Export User Registration Profiles as CSV"

admin.site.unregister(RegistrationProfile)
admin.site.register(models.ViewShareRegistrationProfile, ModeratedRegistrationAdmin)