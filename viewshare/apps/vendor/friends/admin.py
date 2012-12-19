from django.contrib import admin
from viewshare.apps.vendor.friends.models import (Contact,
                                                  Friendship,
                                                  JoinInvitation,
                                                  FriendshipInvitation,
                                                  FriendshipInvitationHistory)

class ContactAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'user', 'added')

class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'to_user', 'added',)

class JoinInvitationAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'contact', 'status')

class FriendshipInvitationAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'to_user', 'sent', 'status',)

class FriendshipInvitationHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_user', 'to_user', 'sent', 'status',)

admin.site.register(Contact, ContactAdmin)
admin.site.register(Friendship, FriendshipAdmin)
admin.site.register(JoinInvitation, JoinInvitationAdmin)
admin.site.register(FriendshipInvitation, FriendshipInvitationAdmin)
admin.site.register(FriendshipInvitationHistory, FriendshipInvitationHistoryAdmin)
