from django.core.exceptions import ObjectDoesNotExist
from django.db.models.expressions import F
from django.db.models.query_utils import Q

class PermissionsRegistry:

    _filter_registry = {}
    _perm_registry = {}

    @classmethod
    def register_filter(cls, perm_dict):
        cls._filter_registry = dict(cls._filter_registry, **perm_dict)

    @classmethod
    def register(cls, perm, callback=None, filter=None):
        if filter is None:
            filter = Q()
        if callback:
            cls._perm_registry[perm] = callback
        cls._filter_registry[perm] = filter


    @classmethod
    def get_callback(cls, perm):
        return cls._perm_registry.get(perm, lambda x,y: False)

    @classmethod
    def get_filter(cls, perm, user):
        return cls._filter_registry[perm](user)


class RegistryBackend:
    supports_object_permissions=True
    supports_anonymous_user = True

    def authenticate(self, username, password):
        return None


    def has_perm(self, user_obj, perm, obj=None):
        if obj is None:
            return False
        pfunc = PermissionsRegistry.get_callback(perm)
        return pfunc(user_obj, obj)

owner_filter = lambda user: Q(owner=user)

def check_owner(user_obj, obj):
    return user_obj.id == obj.owner_id

def check_published(user_obj, obj):
    if obj.published:
        return True
    return check_owner(user_obj, obj)

def published_query_filter(user):
    if user.is_authenticated():
        return Q(published=True)|owner_filter(user)
    return Q(published=True)

def dataset_can_build(user, obj):
    if user.is_authenticated():
        return check_published(user, obj)
    return False


PermissionsRegistry.register('dataset.can_view', check_published, published_query_filter)
PermissionsRegistry.register('dataset.can_inspect', check_published, published_query_filter)
PermissionsRegistry.register('dataset.can_edit', check_owner, owner_filter)

PermissionsRegistry.register('dataset.can_delete', check_owner, owner_filter)
PermissionsRegistry.register('dataset.can_build', dataset_can_build, published_query_filter)
PermissionsRegistry.register('datasource.can_view', check_owner, owner_filter)
PermissionsRegistry.register('datasource.can_edit', check_owner, owner_filter)
PermissionsRegistry.register('datasource.can_delete', check_owner, owner_filter)
PermissionsRegistry.register('datasourcetransaction.can_view', lambda user_obj, obj: user_obj.id==obj.source.owner.id)

def exhibit_can_view(user, obj):
    if user.is_authenticated() and check_owner(user,obj):
        return True
    else:
        return obj.dataset_available(obj.owner) and check_published(user,obj)

def exhibit_view_filter(user):
    if user.is_authenticated():
        # The user is the owner of the exhibit, or has access to the dataset and the exhibit is published
        return owner_filter(user)|((Q(dataset__owner=F("owner"))|Q(dataset__published=True))&Q(published=True))
    return Q(dataset__published=True)&Q(published=True)

def exhibit_can_edit(user, obj):
    if user.is_authenticated() and user.id==obj.owner.id:
        return obj.dataset_available(user)
    return False

def exhibit_edit_filter(user):
    if user.is_authenticated():
        return Q(owner=user)&(Q(dataset__owner=user)|Q(dataset__published=True))
    return Q(owner=None)

def exhibit_can_embed(user,obj):
    return obj.published

def exhibit_embed_filter(user, obj):
    return Q(published=True)

PermissionsRegistry.register('exhibit.can_view', exhibit_can_view, exhibit_view_filter)
PermissionsRegistry.register('exhibit.can_inspect', exhibit_can_view, exhibit_view_filter)
PermissionsRegistry.register('exhibit.can_embed', exhibit_can_embed , exhibit_embed_filter)
PermissionsRegistry.register('exhibit.can_edit', exhibit_can_edit, exhibit_edit_filter)
PermissionsRegistry.register('exhibit.can_delete', check_owner, owner_filter)
PermissionsRegistry.register('exhibit.can_share', check_owner , owner_filter)
