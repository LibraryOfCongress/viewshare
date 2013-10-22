from django.core.urlresolvers import reverse
from django.db.models import Q
from viewshare.apps.exhibit import models


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

    def __init__(self, exhibit, property_name, instance=None, data=None,
                 draft=False):
        self._exhibit = exhibit
        self._property_name = property_name or None
        if not instance:
            self._instance = None
            if property_name:
                f = exhibit.properties.filter(name=property_name)
                if len(f) > 0:
                    self._instance = f[0].get_concrete()
        else:
            self._instance = instance

        self._draft = draft or exhibit.is_draft
        self._data = data
        self._errors = None

    def is_valid(self):
        if self._errors:
            return len(self._errors) == 0

        self._errors = []
        if self._instance:
            expected_class = self.model.__name__
            instance_class = self._instance.__class__.__name__
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
        if not self._data:
            self._data = self.filtered_data
            if self._draft:
                kwargs = {
                    "owner": self._exhibit.owner.username,
                    "slug": self._exhibit.slug,
                    "property": self._instance.name
                }
                property_url = reverse('draft_exhibit_property_json',
                                       kwargs=kwargs)
                data_url = reverse('draft_exhibit_property_data',
                                   kwargs=kwargs)
                self._data["property_url"] = property_url
                self._data["data_url"] = data_url

        return self._data

    @property
    def filtered_data(self):
        return {
            "valueType": self._instance.value_type,
            "label": self._instance.label
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
        if self._instance:
            self._instance = self.model(id=self._instance.id,
                                        **self.instance_kwargs)
        else:
            self._instance = self.model(**self.instance_kwargs)
        self._instance.save()
        if not self._property_name:
            self._property_name = self._instance.name
            del self._data


class CompositePropertySerializer(ExhibitPropertySerializer):

    model = models.CompositeProperty

    augmentation_key = "composite"

    @property
    def data(self):
        if not self._data:
            result = super(CompositePropertySerializer, self).data
            refs = self._instance.composite.all()

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
        super(CompositePropertySerializer, self).save()
        self._instance.composite.clear()
        index = 0

        query = Q(name__in=self.data["composite"])
        props = self._exhibit.properties.filter(query)
        l = []
        for prop in props:
            l.append(models.PropertyReference(derived=self._instance,
                                              source=prop,
                                              order=index))
            index += 1
        models.PropertyReference.objects.bulk_create(l)


class ShreddedListPropertySerializer(ExhibitPropertySerializer):

    model = models.ShreddedListProperty

    @property
    def data(self):
        if not self._data:
            result = super(ShreddedListPropertySerializer, self).data
            result["extract"] = self._instance.source.name
            self._data = result
        return self._data

    def validate(self):
        valid = super(ShreddedListPropertySerializer, self).validate()
        if not "extract" in self.data:
            self._errors.append("'extract' is required")
            valid = False
        return valid

    @property
    def depends_on(self):
        result = super(ShreddedListPropertySerializer, self).depends_on
        result.append(self.data["extract"])
        return result

    @property
    def instance_kwargs(self):
        kwargs = super(ShreddedListPropertySerializer, self).instance_kwargs
        extract = self._exhibit.properties.get(name=self.data["extract"])
        kwargs["source"] = extract
        return kwargs


class DelimitedListPropertySerializer(ShreddedListPropertySerializer):

    model = models.DelimitedListProperty

    augmentation_key = "delimiter-list"

    @property
    def data(self):
        if not self._data:
            result = super(DelimitedListPropertySerializer, self).data
            result["delimiter"] = self._instance.delimiter
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
        if not self._data:
            result = super(PatternListPropertySerializer, self).data
            result["pattern"] = self._instance.pattern
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
        if not self._data:
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


def merge_data(data):
    records = {}

    for prop in data.keys():
        for item in data[prop]:
            key = (item["id"], item["label"])
            record = records.get(key, None)
            if not record:
                record = {"id": item["id"], "label": item["label"]}
                records[key] = record
            record[prop] = item[prop]
    return [records[key] for key in records.keys()]


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
        if len(prop_names):
            for name in prop_names:
                prop = models.ExhibitProperty(name=name,
                                              label=name,
                                              value_type="text").save()
                models.PropertyData(exhibit_property=prop,
                                    json=self._data[name]).save()


#-----------------------------------------------------------------------------#
# Legacy data and profile transform utilities

def legacy_data_profile_to_new(profile):

    def find_type(p):
        for t in ["location", "text", "image", "date", "url", "number"]:
            if "tags" in p.keys() and "property:type=%s" % t in p["tags"]:
                return t

        return "text"

    result = {}
    for old_record in profile:
        prop_name = old_record["property"]
        label = old_record["label"]
        keys = old_record.keys()

        new_record = {
            "label": label,
            "valueType": find_type(old_record)
        }

        if "composite" in keys:
            new_record["composite"] = old_record["composite"]
            new_record["augmentation"] = "composite"
        elif "delimiter" in keys:
            new_record["augmentation"] = "delimited-list"
            new_record["extract"] = old_record["extract"]
            new_record["delimiter"] = old_record["delimiter"]
        elif "pattern" in keys:
            new_record["augmentation"] = "pattern-list"
            new_record["extract"] = old_record["extract"]
            new_record["pattern"] = old_record["pattern"]
        result[prop_name] = new_record

    return result


def new_data_profile_to_legacy(profile):
    result = []
    for prop in profile.keys():
        old_record = profile[prop]
        new_record = {
            "enabled": True,
            "label": old_record["label"],
            "property": prop,
            "tags": [
                "property:type=%s" % old_record["valueType"]
            ]
        }
        if "augmentation" in old_record.keys():
            record_type = old_record["augmentation"]
            if record_type == "composite":
                new_record["composite"] = old_record["composite"]
            elif record_type == "delimited-list":
                new_record["delimiter"] = old_record["delimiter"]
                new_record["tags"].append("property:type=shredded_list")
                new_record["extract"] = old_record["extract"]
            elif record_type == "pattern-list":
                new_record["pattern"] = old_record["pattern"]
                new_record["tags"].append("property:type=shredded_list")
                new_record["extract"] = old_record["extract"]
        result.append(new_record)
    return {"properties": result}

