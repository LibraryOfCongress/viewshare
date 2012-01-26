from django.contrib import admin
from . import models
from django.conf import settings
from registration.admin import RegistrationAdmin
from django.utils.translation import ugettext_lazy as _


class OrganizationTypeAdmin(admin.ModelAdmin):
    list_display=('value',)
    ordering=('value',)
admin.site.register(models.OrganizationType, OrganizationTypeAdmin)

class ModeratedRegistrationAdmin(RegistrationAdmin):
    list_display = ('user', 'is_approved', 'activation_key', 'organization', 'org_type', 'org_state', 'reason')
    list_filter = ('is_approved', 'user__is_active')
    actions = ['approve_users', 'activate_users', 'reject_users', ]
    def reject_users(self, request, queryset):

        for profile in queryset:
            if not profile.is_approved:
                profile.user.delete()
    reject_users.short_description = _("Reject Users")

    def approve_users(self, request, queryset):
        for profile in queryset:
            self.model.objects.approve_profile(profile)

    approve_users.short_description = _("Approve Users")
admin.site.register(models.ViewShareRegistrationProfile, ModeratedRegistrationAdmin)