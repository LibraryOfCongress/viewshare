# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    def forwards(self, orm):

        for exhibit in orm.PublishedExhibit.objects.all():
            exhibit.o = exhibit.owner
            exhibit.s = exhibit.slug
            exhibit.is_draft=False
            exhibit.save()

        for exhibit in orm.DraftExhibit.objects.all():
            exhibit.o = exhibit.owner
            exhibit.s = exhibit.uuid
            exhibit.is_draft=True
            exhibit.save()

    def backwards(self, orm):

        for exhibit in orm.PublishedExhibit.objects.all():
            exhibit.owner = exhibit.o
            exhibit.slug = exhibit.s
            exhibit.save()

        for exhibit in orm.DraftExhibit.objects.all():
            exhibit.owner = exhibit.o
            exhibit.uuid = exhibit.s
            exhibit.save()

    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'exhibit.canvas': {
            'Meta': {'object_name': 'Canvas'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'enabled': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'title'", 'overwrite': 'False'}),
            'thumbnail': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        u'exhibit.compositeproperty': {
            'Meta': {'object_name': 'CompositeProperty', '_ormbases': [u'exhibit.ExhibitProperty']},
            u'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'exhibit.datajsonfile': {
            'Meta': {'object_name': 'DataJSONFile'},
            'exhibit': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'data'", 'unique': 'True', 'to': u"orm['exhibit.Exhibit']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'json': ('django.db.models.fields.TextField', [], {'default': "'{}'"})
        },
        u'exhibit.delimitedlistproperty': {
            'Meta': {'object_name': 'DelimitedListProperty', '_ormbases': ['exhibit.ExhibitProperty']},
            'delimiter': ('django.db.models.fields.TextField', [], {}),
            u'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['exhibit.ExhibitProperty']"})
        },
        u'exhibit.draftexhibit': {
            'Meta': {'ordering': "('-modified',)", 'object_name': 'DraftExhibit', '_ormbases': [u'exhibit.Exhibit']},
            u'exhibit_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.Exhibit']", 'unique': 'True', 'primary_key': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'draft_exhibits'", 'null': 'True', 'to': u"orm['auth.User']"}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['exhibit.PublishedExhibit']", 'null': 'True', 'blank': 'True'}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36', 'blank': 'True'})
        },
        u'exhibit.exhibit': {
            'Meta': {'object_name': 'Exhibit'},
            'canvas': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['exhibit.Canvas']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_draft': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'o': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True'}),
            'profile': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            's': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'blank': 'True'})
        },
        u'exhibit.exhibitproperty': {
            'Meta': {'unique_together': "(('exhibit', 'name'),)", 'object_name': 'ExhibitProperty'},
            'classname': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True'}),
            'exhibit': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'properties'", 'to': u"orm['exhibit.Exhibit']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'value_type': ('django.db.models.fields.CharField', [], {'default': "'text'", 'max_length': '10'})
        },
        u'exhibit.patternlistproperty': {
            'Meta': {'object_name': 'PatternListProperty', '_ormbases': ['exhibit.ExhibitProperty']},
            u'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'}),
            'pattern': ('django.db.models.fields.TextField', [], {}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['exhibit.ExhibitProperty']"})
        },
        u'exhibit.propertyreference': {
            'Meta': {'ordering': "('order',)", 'unique_together': "(('derived', 'source'),)", 'object_name': 'PropertyReference'},
            'derived': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'properties'", 'to': u"orm['exhibit.CompositeProperty']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['exhibit.ExhibitProperty']"})
        },
        u'exhibit.publishedexhibit': {
            'Meta': {'ordering': "('-modified',)", 'unique_together': "(('slug', 'owner'),)", 'object_name': 'PublishedExhibit', '_ormbases': [u'exhibit.Exhibit']},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'exhibit_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.Exhibit']", 'unique': 'True', 'primary_key': 'True'}),
            'is_public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'published_exhibits'", 'null': 'True', 'to': u"orm['auth.User']"}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'title'", 'overwrite': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['exhibit']
    symmetrical = True
