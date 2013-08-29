from freemix.exhibit import models


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

    def __init__(self, exhibit, property_name, instance=None, data=None):
        self._exhibit = exhibit
        self._property_name = property_name
        if not instance:
            f = exhibit.properties.filter(name=property_name)
            if len(f) > 0:
                self._instance = f[0].get_concrete()
            else:
                self._instance=None
        else:
            self._instance = instance
        self._data = data
        self._errors = None


    def is_valid(self):
        if self._errors:
            return len(self._errors) == 0

        self._errors = []
        if self._instance:
            expected_class = self.model.__name__
            instance_class = self._instance.__class__.__name__
            if not isinstance(self._instance, self.model):
                self._errors.append("Existing property is of type %s "
                                "while %s was expected" % (instance_class,
                                                           expected_class))
                return False

        return self.validate()

    @property
    def data(self):
        if not self._data:
            self._data = {
                "valueType": self._instance.value_type,
                "label": self._instance.label
            }
        return self._data

    def validate(self):
        self._errors = []

        if self._instance:
            expected_class = self.model.__name__
            instance_class = self._instance.__class__.__name__
            if expected_class != instance_class:
                self._errors.append("Existing property is of type %s "
                                "while %s was expected" % (instance_class,
                                                           expected_class))
                return False
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
        return {
            "exhibit": self._exhibit,
            "name": self._property_name,
            "label": self.data["label"],
            "value_type": self.data.get("valueType", "text")
        }

    def save(self):
        if self._instance:
            self._instance = self.model(id=self._instance.id,
                                        **self.instance_kwargs)
        else:
            self._instance = self.model(**self.instance_kwargs)
        self._instance.save()


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

        props = self._exhibit.properties.filter(name__in=self.data["composite"])
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
        kwargs["extract"] = extract
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

    def __init__(self, exhibit, queryset=None, data=None):
        self.exhibit = exhibit
        if not queryset:
            queryset = exhibit.properties
        self._queryset = queryset
        self._data = data
        self._serializers = None
        self._errors = None

    @property
    def serializers(self):
        if not self._serializers:
            self._serializers = {}
            if self._data:
                for key in self._data.keys():
                    data = self._data[key]
                    serializer_class = get_serializer_type_by_dict(data)
                    serializer = serializer_class(self.exhibit,
                                                  key,
                                                  data=data)
                    self._serializers[key] = serializer
            elif self._queryset:
                for p in self._queryset.all():
                    p = p.get_concrete()
                    serializer_class = serializer_class_keys[p.classname]
                    serializer = serializer_class(self.exhibit,
                                                  p.name,
                                                  instance=p)
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
        result = True
        if self._errors:
            return len(self._errors.keys()) == 0

        self._errors = {}

        for key in self.serializers.keys():
            serializer = self.serializers[key]
            if not serializer.is_valid():
                result = False
                self._errors[key] = serializer._errors
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
            elif self.exhibit.properties.filter(name=name).count() == 0:

                models.ExhibitProperty(exhibit=self.exhibit,
                                       name=name,
                                       label=name,
                                       value_type="text").save()
            finished.append(name)


        for name in self.serializers.keys():
            process_property(name)