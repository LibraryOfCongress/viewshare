from django.core.urlresolvers import reverse
from django.db.models import Q
from viewshare.apps.exhibit import models
import logging

logger = logging.getLogger(__name__)


class Serializer(object):

    @property
    def errors(self):
        if not self._errors:
            self.is_valid()
        return self._errors

    def is_valid(self):
        self._errors = []
        return True

    @property
    def data(self):
        return {}

    def save(self):
        pass


class ExhibitPropertySerializer(Serializer):

    model = models.ExhibitProperty

    def __init__(self, exhibit, property_name=None, instance=None, data=None,
                 draft=False):
        self._exhibit = exhibit
        self._property_name = property_name
        if not instance:
            self.instance = None
            if property_name:
                f = exhibit.properties.filter(name=property_name)
                if len(f) > 0:
                    self.instance = f[0].get_concrete()
        else:
            self.instance = instance

        self._draft = draft or exhibit.is_draft
        self._data = data
        self._errors = None

    def is_valid(self):
        if self._errors:
            return len(self._errors) == 0

        self._errors = []
        if self.instance:
            expected_class = self.model.__name__
            instance_class = self.instance.__class__.__name__
            if expected_class != instance_class:
                error = ("Existing property %s is of type %s "
                         "while %s was expected" % (self._property_name,
                                                    instance_class,
                                                    expected_class))
                self._errors.append(error)
                return False
        if self._data:
            if not isinstance(self._data, dict):
                self._errors.append("Expected a valid JSON object "
                                    "for %s" % self._property_name)
                return False
        return self.validate()

    @property
    def data(self):
        if not hasattr(self, '_data') or not self._data:
            self._data = self.filtered_data
            if self._draft:
                kwargs = {
                    "owner": self._exhibit.owner.username,
                    "slug": self._exhibit.slug,
                    "property": self.instance.name
                }
                property_url = reverse('draft_exhibit_property_json',
                                       kwargs=kwargs)
                data_url = reverse('draft_exhibit_property_data',
                                   kwargs=kwargs)
                self._data["property_url"] = property_url
                self._data["data_url"] = data_url
                self._data["id"] = self.instance.name

        return self._data

    @property
    def filtered_data(self):
        return {
            "valueType": self.instance.value_type,
            "label": self.instance.label
        }

    def validate(self):
        valid = True
        if not "label" in self.data:
            self._errors.append("'label' is required")
            valid = False
        if not "valueType" in self.data:
            self._errors.append("'valueType' is required")
            valid = False
        return valid

    @property
    def depends_on(self):
        return []

    def check_dependencies(self):
        if len(self.depends_on) == 0:
            return True
        return (self._exhibit.properties
                .filter(name__in=self.depends_on)
                .distinct().count() == len(self.depends_on))

    @property
    def instance_kwargs(self):
        kwargs = {
            "exhibit": self._exhibit,
            "label": self.data["label"],
            "value_type": self.data.get("valueType", "text")
        }
        if self._property_name:
            kwargs["name"] = self._property_name
        return kwargs

    def save(self):
        if self.instance:
            self.instance = self.model(id=self.instance.id,
                                       **self.instance_kwargs)
        else:
            self.instance = self.model(**self.instance_kwargs)
        self.instance.save()
        if not self._property_name:
            self._property_name = self.instance.name


class CompositePropertySerializer(ExhibitPropertySerializer):

    model = models.CompositeProperty

    augmentation_key = "composite"

    @property
    def data(self):
        if not hasattr(self, '_data') or not self._data:
            result = super(CompositePropertySerializer, self).data
            refs = self.instance.composite.all()

            result["composite"] = [p.name for p in refs]
            result["augmentation"] = self.augmentation_key
            self._data = result
        return self._data

    def validate(self):
        valid = super(CompositePropertySerializer, self).validate()
        if not "augmentation" in self.data or \
                self.data["augmentation"] != self.augmentation_key:
            self._errors.append("Composite property definition expected")
            valid = False
        if not "composite" in self.data:
            self._errors.append("'composite' is required")
            valid = False
        return valid

    @property
    def depends_on(self):
        result = super(CompositePropertySerializer, self).depends_on
        result.extend(self.data["composite"])
        return result

    def save(self):
        composites = self.data["composite"]
        super(CompositePropertySerializer, self).save()
        self.instance.composite.clear()
        index = 0

        query = Q(name__in=composites)
        props = self._exhibit.properties.filter(query)
        l = []
        for prop in props:
            l.append(models.PropertyReference(derived=self.instance,
                                              source=prop,
                                              order=index))
            index += 1
        models.PropertyReference.objects.bulk_create(l)


class ShreddedListPropertySerializer(ExhibitPropertySerializer):

    model = models.ShreddedListProperty

    @property
    def data(self):
        if not hasattr(self, '_data') or not self._data:
            result = super(ShreddedListPropertySerializer, self).data
            result["source"] = self.instance.source.name
            self._data = result
        return self._data

    def validate(self):
        valid = super(ShreddedListPropertySerializer, self).validate()
        if not "source" in self.data:
            self._errors.append("'source' is required")
            valid = False
        return valid

    @property
    def depends_on(self):
        result = super(ShreddedListPropertySerializer, self).depends_on
        result.append(self.data["source"])
        return result

    @property
    def instance_kwargs(self):
        kwargs = super(ShreddedListPropertySerializer, self).instance_kwargs
        source = self._exhibit.properties.get(name=self.data["source"])
        kwargs["source"] = source
        return kwargs


class DelimitedListPropertySerializer(ShreddedListPropertySerializer):

    model = models.DelimitedListProperty

    augmentation_key = "delimited-list"

    @property
    def data(self):
        if not hasattr(self, '_data') or not self._data:
            result = super(DelimitedListPropertySerializer, self).data
            result["delimiter"] = self.instance.delimiter
            result["augmentation"] = self.augmentation_key

            self._data = result
        return self._data

    def validate(self):
        valid = super(DelimitedListPropertySerializer, self).validate()
        if not "augmentation" in self.data or \
                self.data["augmentation"] != self.augmentation_key:
            self._errors.append("Delimited List property definition expected")
            valid = False
        if not "delimiter" in self.data:
            self._errors.append("'delimiter' is required")
            valid = False
        return valid

    @property
    def instance_kwargs(self):
        kwargs = super(DelimitedListPropertySerializer, self).instance_kwargs
        kwargs["delimiter"] = self.data["delimiter"]
        return kwargs


class PatternListPropertySerializer(ShreddedListPropertySerializer):

    model = models.PatternListProperty

    augmentation_key = "pattern-list"

    @property
    def data(self):
        if not hasattr(self, '_data') or not self._data:
            result = super(PatternListPropertySerializer, self).data
            result["pattern"] = self.instance.pattern
            result["augmentation"] = self.augmentation_key
            self._data = result
        return self._data

    def validate(self):
        valid = super(PatternListPropertySerializer, self).validate()
        if not "augmentation" in self.data or \
                self.data["augmentation"] != self.augmentation_key:
            self._errors.append("Pattern List property definition expected")
            valid = False
        if not "pattern" in self.data:
            self._errors.append("'pattern' is required")
            valid = False
        return valid

    @property
    def instance_kwargs(self):
        kwargs = super(PatternListPropertySerializer, self).instance_kwargs
        kwargs["pattern"] = self.data["pattern"]
        return kwargs


serializer_dict_keys = {}
serializer_class_keys = {}


def register_serializer(cls):
    if hasattr(cls, "augmentation_key"):
        serializer_dict_keys[cls.augmentation_key] = cls
    serializer_class_keys[cls.model.__name__] = cls

register_serializer(ExhibitPropertySerializer)
register_serializer(CompositePropertySerializer)
register_serializer(DelimitedListPropertySerializer)
register_serializer(PatternListPropertySerializer)


def get_serializer_type_by_dict(data):
    if "augmentation" in data and data["augmentation"] in serializer_dict_keys:
        return serializer_dict_keys[data["augmentation"]]
    return ExhibitPropertySerializer


class ExhibitPropertyListSerializer(Serializer):
    """
    A bidirectional serializer that accepts a list of properties and parses
    them based on their expected property type
    """

    def __init__(self, exhibit, queryset=None, data=None, draft=False):
        self.exhibit = exhibit
        if not queryset:
            queryset = exhibit.properties.all()
        self._queryset = queryset
        self._data = data
        self._serializers = None
        self._errors = None
        self._draft = draft or exhibit.is_draft

    @property
    def serializers(self):
        if not self._serializers:
            self._serializers = {}
            if self._data:
                if not isinstance(self._data, dict):
                    self._errors.append("Expected a valid JSON object")
                    return self._serializers
                for key in self._data.keys():
                    data = self._data[key]
                    serializer_class = get_serializer_type_by_dict(data)
                    serializer = serializer_class(self.exhibit,
                                                  key,
                                                  data=data,
                                                  draft=self._draft)
                    self._serializers[key] = serializer
            elif self._queryset:
                for p in self._queryset.all():
                    p = p.get_concrete()
                    serializer_class = serializer_class_keys[p.classname]
                    serializer = serializer_class(self.exhibit,
                                                  p.name,
                                                  instance=p,
                                                  draft=self._draft)
                    self._serializers[p.name] = serializer
        return self._serializers

    @property
    def data(self):
        if not hasattr(self, '_data') or not self._data:
            result = dict()
            for p in self._queryset.all():
                result.update({
                    p.name: self.serializers[p.name].data
                })
            self._data = result
        return self._data

    def is_valid(self):
        """
        Returns true if the provided data is valid
        """

        result = True
        if self._errors:
            # shortcut for repeated calls
            return len(self._errors) == 0

        self._errors = []
        serializers = self.serializers
        if len(self._errors) > 0:
            # generating serializers can create errors
            return False

        for key in serializers.keys():
            # Validate each property
            serializer = self.serializers[key]
            if not serializer.is_valid():
                result = False
                self._errors += serializer.errors
        return result

    def save(self):
        finished = []

        def process_property(name):
            if name in finished:
                return
            if name in self.serializers.keys():
                serializer = self.serializers[name]
                for p in serializer.depends_on:
                    process_property(p)
                serializer.save()
            elif not self.exhibit.properties.exists(name=name):

                models.ExhibitProperty(exhibit=self.exhibit,
                                       name=name,
                                       label=name,
                                       value_type="text").save()
            finished.append(name)

        for name in self.serializers.keys():
            process_property(name)


def separate_data(data):

    properties = {}
    counter = 0
    for record in data:
        ex_id = record.get("id", None)
        if not ex_id:
            ex_id = "_%d" % counter
            counter += 1
        label = record.get("label", ex_id)
        for key in record.keys():
            if key == "id" or key == "label":
                continue

            arr = properties.get(key, [])
            arr.append({"id": ex_id, "label": label, key: record[key]})
            properties[key] = arr
    return properties


class ExhibitDataSerializer(Serializer):

    def __init__(self, exhibit,
                 queryset=None,
                 data=None):
        self.exhibit = exhibit
        if not queryset:
            query = Q(exhibit_property__exhibit=exhibit)
            queryset = models.PropertyData.objects.filter(query)
        self._queryset = queryset
        self._data = data
        self._processed = False
        self._errors = None

    def is_valid(self):
        self._errors = []
        return True

    @property
    def data(self):
        if not self._data:
            result = dict()
            for p in (self.exhibit.properties
                      .exclude(data=None)
                      .prefetch_related("data__json")):
                result[p.name] = p.data.json
            self._data = result
            self._processed = True
        elif not self._processed:
            if isinstance(self._data, dict):
                self._processed = True
            elif isinstance(self._data, list):
                self._data = separate_data(self._data)
                self._processed = True
        return self._data

    def save(self):
        # First update existing data records
        prop_names = self.data.keys()

        query = Q(exhibit_property__name__in=prop_names,
                  exhibit_property__exhibit=self.exhibit)
        prop_data = models.PropertyData.objects.filter(query)

        for rec in prop_data:
            name = rec.exhibit_property.name
            rec.json = self._data[name]
            rec.save()
            prop_names.remove(name)

        # Create Property Data for existing records
        props = self.exhibit.properties.filter(name__in=prop_names)
        for p in props:
            val = {
                "exhibit_property": p,
                "json": self._data[p.name]
            }
            models.PropertyData(**val).save()
            prop_names.remove(p.name)

        # Create any new properties, then save the data
        for name in prop_names:
            logger.debug("Creating property %s for %s/%s" % (
                name, self.exhibit.owner.username, self.exhibit.slug))
            prop = models.ExhibitProperty(exhibit=self.exhibit,
                                          name=name,
                                          label=name,
                                          value_type="text")
            prop.save()
            logger.debug("Saving property data for %s in %s/%s" % (
                name,
                self.exhibit.owner.username,
                self.exhibit.slug
            ))
            val = {
                "exhibit_property": prop,
                "json": self._data[name]
            }
            models.PropertyData(**val).save()
