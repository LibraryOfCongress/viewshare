from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.template.loader import render_to_string
from django_extensions.db.fields import AutoSlugField, UUIDField
from django_extensions.db.fields.json import JSONField
from django_extensions.db.models import (TitleSlugDescriptionModel,
                                         TimeStampedModel)
from viewshare.apps.legacy.dataset.models import Dataset



class Canvas(TitleSlugDescriptionModel):
    """
    A reference to a template that contains the HTML for an Exhibit canvas
    """

    location = models.CharField(_('location'), unique=True, max_length=100,
                                help_text=_("Example: "
                                            "'exhibit/canvas/"
                                            "three-column.html'"))

    thumbnail = models.URLField(_('thumbnail'))

    enabled = models.BooleanField(_('enabled'), null=False, default=True)

    def get_html(self):
        return render_to_string(self.location, {})

    def __unicode__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Canvases"


class Exhibit(TimeStampedModel):

    profile = JSONField()

    dataset = models.ForeignKey(Dataset,
                                null=True,
                                blank=True,
                                related_name="exhibits")

    canvas = models.ForeignKey(Canvas)

    def dataset_available(self, user):
        """
        True if the provided user is able to view the dataset associated
        with this exhibit
        """
        ds = self.dataset
        if not ds or not user.has_perm("dataset.can_view", ds):
            return False
        return True

    def update_from_profile(self, profile):
        self.profile = profile
        self.save()


class PublishedExhibit(Exhibit):
    """
    A published exhibit with a title and slug for display to end users
    """

    is_public = models.BooleanField(default=True)
    owner = models.ForeignKey(User,
                              null=True,
                              blank=True,
                              related_name="published_exhibits")

    title = models.CharField(_('title'), max_length=255)
    slug = AutoSlugField(_('slug'), populate_from='title')
    description = models.TextField(_('description'), blank=True, null=True)

    def natural_key(self):
        return self.owner, self.slug

    @models.permalink
    def get_absolute_url(self):
        return ('exhibit_display', (), {
            'owner': self.owner.username,
            'slug': self.slug})

    def __unicode__(self):
        return self.title

    class Meta:
        unique_together = ("slug", "owner")
        ordering = ('-modified', )


class DraftExhibit(Exhibit):
    """
    A draft exhibit for editing.  Modifications to a `DraftExhibit` will
    not be visible to end users.  If `parent` is populated, the draft should
    be a copy of the reference `PublishedExhibit`.  Publishing the draft will
    move the contents of the `DraftExhibit` into the `PublishedExhibit` and the
    draft will be deleted.  If `parent` is null, a new `PublishedExhibit` will
    be created on publication.
    """
    owner = models.ForeignKey(User,
                              null=True,
                              blank=True,
                              related_name="draft_exhibits")

    uuid = UUIDField(version=4)

    parent = models.ForeignKey(PublishedExhibit,
                               null=True,
                               blank=True)

    class Meta:
        verbose_name_plural = "Exhibits"
        verbose_name = "Exhibit"
        ordering = ('-modified', )


class DataJSONFile(models.Model):
    """
    The data associated with this exhibit in the Exhibit JSON format
    """
    exhibit = models.OneToOneField(Exhibit, related_name="data")

    json = JSONField()


#-----------------------------------------------------------------------------#
# Exhibit Property Types
#-----------------------------------------------------------------------------#

VALUE_TYPES = {
    "text": "text",
    "url": "URL",
    "image": "image",
    "date": "date/time",
    "location": "location",
    "number": "number"
}


class ExhibitPropertyManager(models.Manager):
    """
    Utility methods for the filtered properties on a particular exhibit
    """
    use_for_related_fields = True

    def to_dict(self):
        """
        Return a dict in exhibit JSON format for property descriptions
        """
        qs = self.get_query_set()
        result = dict()
        for p in qs.all():
            result.update(p.to_dict())
        return {"properties": result}

    def to_profile_dict(self):
        """
        Return a dict of properties in the legacy freemix data profile format
        """
        qs = self.get_query_set()
        result = [p.get_concrete().to_profile_dict() for p in qs.all()]
        return {"properties": result}


class ExhibitProperty(models.Model):
    """
    The Base class for defining individual properties in an exhibit
    dataset.  The properties defined in this class should be adequate
    for reference in published exhibits and basic properties.
    """

    default_manager = ExhibitPropertyManager()

    classname = models.CharField(max_length=32, editable=False, null=True)

    exhibit = models.ForeignKey(Exhibit,
                                related_name="properties")

    label = models.CharField(_('label'), max_length=255)

    name = models.CharField(_('name'), max_length=255)

    value_type = models.CharField(choices=[(k, v) for k, v in
                                           VALUE_TYPES.iteritems()],
                                  default="text",
                                  max_length=10)

    class Meta:
        unique_together = ('exhibit', 'name')

    def natural_key(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.classname is None:
            self.classname = self.__class__.__name__
        return super(ExhibitProperty, self).save(*args, **kwargs)

    def get_concrete(self):
        if self.classname == "ExhibitProperty":
            return self
        return self.__getattribute__(self.classname.lower())

    def is_concrete(self):
        return self.classname == self.__class__.__name__

    def to_dict(self):
        return {
            self.name: {
                "label": self.label,
                "valueType": self.value_type
            }
        }

    def to_profile_dict(self):
        return {
            "enabled": True,
            "label": self.label,
            "property": self.name,
            "tags": [
                "property:type=%s" % self.value_type,
            ]

        }


class CompositeProperty(ExhibitProperty):
    """
    Enhanced property that is derived from other properties.  This
    covers both date/time and location derivations.  An ordered list of
    source properties is defined using the PropertyReference model.
    """

    def to_dict(self):
        d = super(CompositeProperty, self).to_dict()
        d[self.name]["composite"] = self.properties.to_array()
        return d

    def to_profile_dict(self):
        d = super(CompositeProperty, self).to_profile_dict()
        d["composite"] = self.properties.to_array()
        return d


class PropertyReferenceManager(models.Manager):
    """
    Utility methods for property references for Composite properties
    """
    use_for_related_fields = True

    def to_array(self):
        """
        Return a list of the names of all properties in the queryset
        """
        qs = self.get_query_set()
        return [p.source.name for p in qs.all()]


class PropertyReference(models.Model):
    """
    A reference to a property used in the derivation of a composite property.
        `derived`: the composite property
        `source`: The referenced property
        `order`: The referenced property's position in the list of sources
    """

    default_manager = PropertyReferenceManager()

    derived = models.ForeignKey('CompositeProperty', related_name="properties")

    source = models.ForeignKey(ExhibitProperty)

    order = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ("derived", "source", )
        ordering = ("order", )


class ShreddedListProperty(ExhibitProperty):
    """
    Abstract Base class for properties that derive a list from another property
    """
    source = models.ForeignKey(ExhibitProperty, related_name="+")

    def to_dict(self):
        d = super(ShreddedListProperty, self).to_dict()
        d[self.name]["extract"] = self.source.name
        return d

    def to_profile_dict(self):
        d = super(ShreddedListProperty, self).to_profile_dict()
        d["extract"] = self.source.name
        d["tags"].append("property:type=shredded_list")

    class Meta:
        abstract = True


class DelimitedListProperty(ShreddedListProperty):
    """
    Enhanced list property that is split based on a string delimiter
    """
    delimiter = models.TextField(_("delimiter"))

    def to_dict(self):
        d = super(DelimitedListProperty, self).to_dict()
        d[self.name]["delimiter"] = self.delimiter
        return d

    def to_profile_dict(self):
        d = super(DelimitedListProperty, self).to_profile_dict()
        d["delimiter"] = self.delimiter
        return d


class PatternListProperty(ShreddedListProperty):
    """
    Enhanced list property this is split based on a regular expression
    """

    pattern = models.TextField(_("pattern"))

    def to_dict(self):
        d = super(PatternListProperty, self).to_dict()
        d[self.name]["pattern"] = self.pattern
        return d

    def to_profile_dict(self):
        d = super(PatternListProperty, self).to_profile_dict()
        d["pattern"] = self.pattern
        return d
