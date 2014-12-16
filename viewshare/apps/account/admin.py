from django.contrib import admin
from viewshare.apps.account import models


class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ('user', 'temp_key', 'timestamp', 'reset')

admin.site.register(models.PasswordReset, PasswordResetAdmin)


class EmailConfirmationAdmin(admin.ModelAdmin):
    list_display = ('user', 'temp_key', 'timestamp', 'email')

admin.site.register(models.EmailConfirmation, EmailConfirmationAdmin)
