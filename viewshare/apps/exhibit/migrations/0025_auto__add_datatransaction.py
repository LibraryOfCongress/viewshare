# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'DataTransaction'
        db.create_table(u'exhibit_datatransaction', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('modified', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('is_complete', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'exhibit', ['DataTransaction'])


    def backwards(self, orm):
        # Deleting model 'DataTransaction'
        db.delete_table(u'exhibit_datatransaction')


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
            'composite': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'+'", 'symmetrical': 'False', 'through': u"orm['exhibit.PropertyReference']", 'to': u"orm['exhibit.ExhibitProperty']"}),
            u'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'exhibit.datatransaction': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'DataTransaction'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_complete': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'exhibit.delimitedlistproperty': {
            'Meta': {'object_name': 'DelimitedListProperty'},
            'delimiter': ('django.db.models.fields.TextField', [], {}),
            u'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['exhibit.ExhibitProperty']"})
        },
        u'exhibit.draftexhibit': {
            'Meta': {'ordering': "('-modified',)", 'object_name': 'DraftExhibit', '_ormbases': [u'exhibit.Exhibit']},
            u'exhibit_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.Exhibit']", 'unique': 'True', 'primary_key': 'True'}),
            'parent': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.PublishedExhibit']", 'unique': 'True', 'null': 'True', 'blank': 'True'})
        },
        u'exhibit.exhibit': {
            'Meta': {'unique_together': "(('owner', 'slug', 'is_draft'),)", 'object_name': 'Exhibit'},
            'canvas': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['exhibit.Canvas']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_draft': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True'}),
            'profile': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'blank': 'True'})
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
            'Meta': {'object_name': 'PatternListProperty'},
            u'exhibitproperty_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.ExhibitProperty']", 'unique': 'True', 'primary_key': 'True'}),
            'pattern': ('django.db.models.fields.TextField', [], {}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'+'", 'to': u"orm['exhibit.ExhibitProperty']"})
        },
        u'exhibit.propertydata': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'PropertyData'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'exhibit_property': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'data'", 'unique': 'True', 'to': u"orm['exhibit.ExhibitProperty']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'json': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'})
        },
        u'exhibit.propertyreference': {
            'Meta': {'ordering': "('order',)", 'unique_together': "(('derived', 'source'),)", 'object_name': 'PropertyReference'},
            'derived': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'properties'", 'to': u"orm['exhibit.CompositeProperty']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['exhibit.ExhibitProperty']"})
        },
        u'exhibit.publishedexhibit': {
            'Meta': {'ordering': "('-modified',)", 'object_name': 'PublishedExhibit', '_ormbases': [u'exhibit.Exhibit']},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'exhibit_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['exhibit.Exhibit']", 'unique': 'True', 'primary_key': 'True'}),
            'is_public': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['exhibit']