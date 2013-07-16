from django.core.exceptions import ObjectDoesNotExist
from django.db.models.expressions import F
from django.db.models.query_utils import Q


def generate_context_field(context):
    if len(context) > 0:
            context += "__"
    def _f(key):
        return F(context+key)
    return _f

def generate_context_filter(context):
    """generates a field filter string based on the passed in context, which should be a
       parent field filter.  For example:
         >>> _c("dataset", "name")
         dataset__name

       This is useful for building generic filters for a particular model and being able to filter
       querysets on models with foreign keys to it.
       """
    if len(context) > 0:
        context += "__"
    def _q(key, value):
        return Q(**{F("%s%s"%(context,key)).name: value})
    return _q


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
    def get_filter(cls, perm, user, context=""):
        return cls._filter_registry[perm](user, context)


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

def owner_filter(user, context=""):
    _c = generate_context_filter(context)
    return _c("owner", user)

def check_owner(user_obj, obj):
    return user_obj.id == obj.owner_id

def check_published(user_obj, obj):
    if obj.is_public:
        return True
    return check_owner(user_obj, obj)

def published_query_filter(user, context=""):
    _c = generate_context_filter(context)
    p = _c("published", True)
    if user.is_authenticated():
        return p|owner_filter(user, context)
    return p

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

def exhibit_can_view(user, obj):
    if user.is_authenticated() and check_owner(user,obj):
        return True
    else:
        return obj.dataset_available(obj.owner) and check_published(user,obj)


def exhibit_can_edit(user, obj):
    if user.is_authenticated() and user.id==obj.owner.id:
        return obj.dataset_available(user)
    return False



def exhibit_can_embed(user,obj):
    return obj.published

def exhibit_embed_filter(user, context=""):
    _q = generate_context_filter(context)
    return _q("published", True)


def exhibit_view_filter(user, context=""):
    _q = generate_context_filter(context)
    _f = generate_context_field(context)

    owner = owner_filter(user, context)
    published = _q("published", True)

    dataset_owner = _q("dataset__owner", _f("owner"))
    dataset_published = _q("dataset__published", True)

    if user.is_authenticated():
        # The user is the owner of the exhibit, or has access to the dataset and the exhibit is published
        return owner|((dataset_owner|dataset_published)&published)
    return dataset_published&published

def exhibit_edit_filter(user, context=""):
    _q = generate_context_filter(context)
    owner = owner_filter(user, context)

    dataset_owner = _q("dataset__owner", user)
    dataset_published = _q("dataset__published", True)


    if user.is_authenticated():
        return owner&(dataset_owner|dataset_published)
    return _q("owner", None)

PermissionsRegistry.register('exhibit.can_view', exhibit_can_view, exhibit_view_filter)
PermissionsRegistry.register('exhibit.can_inspect', exhibit_can_view, exhibit_view_filter)
PermissionsRegistry.register('exhibit.can_embed', exhibit_can_embed , exhibit_embed_filter)
PermissionsRegistry.register('exhibit.can_edit', exhibit_can_edit, exhibit_edit_filter)
PermissionsRegistry.register('exhibit.can_delete', check_owner, owner_filter)
PermissionsRegistry.register('exhibit.can_share', check_owner , owner_filter)
