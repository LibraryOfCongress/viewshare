# -*- coding: utf-8 -*-
import datetime
import json
from south.db import db
from south.v2 import DataMigration
from django.db import models

def find_type(p):
    for t in ["location", "text", "image", "date", "url", "number"]:
        if "tags" in p.keys() and "property:type=%s"%t in p["tags"]:
            return t

    return "text"

def create_property(orm, properties, exhibit, name):
    prop = orm.ExhibitProperty(classname="ExhibitProperty",
                        name=name,
                        label=name,
                        value_type="text",
                        exhibit=exhibit)
    prop.save()
    properties[name] = prop
    return prop


class Migration(DataMigration):

    def forwards(self, orm):
        # Migrate Dataset's json files into the new exhibit data model

        for exhibit in orm.Exhibit.objects.all():

            # Create a dummy place holder property

            dummy = orm.ExhibitProperty(exhibit = exhibit,
                                        name="dummy_for_south_migration",
                                        label="dummy_for_south_migration",
                                        value_type="text",
                                        classname="ExhibitProperty")
            dummy.save()

            dataset = exhibit.dataset
            data = orm["dataset.datasetjsonfile"].objects.get(dataset=dataset).data
            profile = orm["dataset.datasetprofile"].objects.get(dataset=dataset).data
            orm.DataJSONFile(exhibit=exhibit, json=data).save()

            profile = json.loads(profile)
            properties = {}
            second_pass = []
            for p in profile["properties"]:


                # Do a first run through the properties to
                # ensure that all properties exist before
                # creating references
                k = p.keys()
                kw  = {}
                value_type = find_type(p)
                name = p["property"]
                label = p["label"]

                if name in properties.keys():
                    print("Duplicate property: %s in %d" % (name, exhibit.id))
                    continue


                if "composite" in k:
                    classname = "CompositeProperty"

                    cl = orm.CompositeProperty
                    second_pass.append(p)
                elif "delimiter" in k:
                    cl = orm.DelimitedListProperty
                    classname = "DelimitedListProperty"
                    second_pass.append(p)
                    kw["source"] = dummy
                elif "pattern" in k:
                    cl = orm.PatternListProperty
                    classname = "PatternListProperty"
                    second_pass.append(p)
                    kw["source"] = dummy

                else:
                    cl = orm.ExhibitProperty
                    classname="ExhibitProperty"
                prop = cl(exhibit=exhibit,
                           name=name,
                           label=label,
                           value_type=value_type,
                           classname=classname,
                           **kw)
                prop.save()
                properties[name] = prop

            for p in second_pass:
                # Now create the extension objects for augmented properties

                prop = properties[p["property"]]
                k = p.keys()
                if "composite" in k:
                    counter = 1
                    for c in p["composite"]:

                        if not c in properties.keys():
                            print("Property %s not found for Composite property in exhibit %d" % (c, exhibit.id))

                            create_property(orm, properties, exhibit, c)
                        ref = orm.PropertyReference(derived=prop,
                                                    source=properties[c],
                                                    order=counter)
                        counter += 1
                        ref.save()


                elif "delimiter" in k:

                    if not p["extract"] in properties.keys():
                        print ("Property %s not found for delimiter source in exhibit %d" % (p["extract"], exhibit.id))
                        create_property(orm, properties, exhibit, p["extract"])
                    prop.source = properties[p["extract"]]
                    prop.delimiter = p["delimiter"]
                    prop.save()


                elif "pattern" in k:

                    if not p["extract"] in properties.keys():

                        print ("Property %s not found for pattern source in exhibit %d" % (p["extract"], exhibit.id))
                        create_property(orm, properties, exhibit, p["extract"])

                    prop.source = properties[p["extract"]]
                    prop.pattern = p["pattern"]
                    prop.save()


            dummy.delete()

            exhibit.save()



    def backwards(self, orm):
        "Write your backwards methods here."

    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'dataset.dataset': {
            'Meta': {'ordering': "('-modified',)", 'unique_together': "(('slug', 'owner'),)", 'object_name': 'Dataset'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'datasets'", 'null': 'True', 'to': "orm['auth.User']"}),
            'published': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'title'", 'overwrite': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'dataset.datasetjsonfile': {
            'Meta': {'object_name': 'DatasetJSONFile'},
            'data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'data'", 'unique': 'True', 'to': "orm['dataset.Dataset']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'dataset.datasetprofile': {
            'Meta': {'object_name': 'DatasetProfile'},
            'data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'profile'", 'unique': 'True', 'to': "orm['dataset.Dataset']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'exhibit.canvas': {
            'Meta': {'object_name': 'Canvas'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'enabled': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'title'", 'overwrite': 'False'}),
            'thumbnail': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'exhibit.compositeproperty': {
            'Meta': {'object_name': 'CompositeProperty', '_ormbases': ['exhibit.ExhibitProperty']},
            'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'})
        },
        'exhibit.datajsonfile': {
            'Meta': {'object_name': 'DataJSONFile'},
            'exhibit': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'data'", 'unique': 'True', 'to': "orm['exhibit.Exhibit']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'json': ('django.db.models.fields.TextField', [], {'default': "'{}'"})
        },
        'exhibit.delimitedlistproperty': {
            'Meta': {'object_name': 'DelimitedListProperty', '_ormbases': ['exhibit.ExhibitProperty']},
            'delimiter': ('django.db.models.fields.TextField', [], {}),
            'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': "orm['exhibit.ExhibitProperty']"})
        },
        'exhibit.draftexhibit': {
            'Meta': {'ordering': "('-modified',)", 'object_name': 'DraftExhibit', '_ormbases': ['exhibit.Exhibit']},
            'exhibit_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['exhibit.Exhibit']", 'unique': 'True', 'primary_key': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'draft_exhibits'", 'null': 'True', 'to': "orm['auth.User']"}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['exhibit.PublishedExhibit']", 'null': 'True', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36', 'blank': 'True'})
        },
        'exhibit.exhibit': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'Exhibit'},
            'canvas': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['exhibit.Canvas']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'dataset': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'exhibits'", 'null': 'True', 'to': "orm['dataset.Dataset']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'profile': ('django.db.models.fields.TextField', [], {'default': "'{}'"})
        },
        'exhibit.exhibitproperty': {
            'Meta': {'unique_together': "(('exhibit', 'name'),)", 'object_name': 'ExhibitProperty'},
            'classname': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True'}),
            'exhibit': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'properties'", 'to': "orm['exhibit.Exhibit']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'value_type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '10'})
        },
        'exhibit.patternlistproperty': {
            'Meta': {'object_name': 'PatternListProperty', '_ormbases': ['exhibit.ExhibitProperty']},
            'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'}),
            'pattern': ('django.db.models.fields.TextField', [], {}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': "orm['exhibit.ExhibitProperty']"})
        },
        'exhibit.propertyreference': {
            'Meta': {'ordering': "('order',)", 'unique_together': "(('derived', 'source'),)", 'object_name': 'PropertyReference'},
            'derived': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'properties'", 'to': "orm['exhibit.CompositeProperty']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['exhibit.ExhibitProperty']"})
        },
        'exhibit.publishedexhibit': {
            'Meta': {'ordering': "('-modified',)", 'unique_together': "(('slug', 'owner'),)", 'object_name': 'PublishedExhibit', '_ormbases': ['exhibit.Exhibit']},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'exhibit_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['exhibit.Exhibit']", 'unique': 'True', 'primary_key': 'True'}),
            'is_public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'published_exhibits'", 'null': 'True', 'to': "orm['auth.User']"}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'title'", 'overwrite': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['exhibit']
    symmetrical = True
