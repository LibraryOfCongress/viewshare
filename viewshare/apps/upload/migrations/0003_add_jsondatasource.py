# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'JSONFileDataSource'
        db.create_table('upload_jsonfiledatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('file', self.gf('django.db.models.fields.files.FileField')(max_length=255)),
            ('path', self.gf('django.db.models.fields.TextField')()),
            ('mapping', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('upload', ['JSONFileDataSource'])

        # Adding model 'JSONURLDataSource'
        db.create_table('upload_jsonurldatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('path', self.gf('django.db.models.fields.TextField')()),
            ('mapping', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('upload', ['JSONURLDataSource'])


    def backwards(self, orm):
        # Deleting model 'JSONFileDataSource'
        db.delete_table('upload_jsonfiledatasource')

        # Deleting model 'JSONURLDataSource'
        db.delete_table('upload_jsonurldatasource')


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
        'dataset.datasource': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'DataSource'},
            'classname': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'source'", 'unique': 'True', 'null': 'True', 'to': "orm['dataset.Dataset']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'data_sources'", 'null': 'True', 'to': "orm['auth.User']"}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36', 'blank': 'True'})
        },
        'upload.contentdmdatasource': {
            'Meta': {'object_name': 'ContentDMDataSource', '_ormbases': ['dataset.DataSource']},
            'collection': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'limit': ('django.db.models.fields.IntegerField', [], {'default': "'100'"}),
            'query': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'upload.filedatasource': {
            'Meta': {'object_name': 'FileDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'})
        },
        'upload.jsonfiledatasource': {
            'Meta': {'object_name': 'JSONFileDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            'mapping': ('django.db.models.fields.TextField', [], {}),
            'path': ('django.db.models.fields.TextField', [], {})
        },
        'upload.jsonurldatasource': {
            'Meta': {'object_name': 'JSONURLDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'mapping': ('django.db.models.fields.TextField', [], {}),
            'path': ('django.db.models.fields.TextField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'upload.modsfiledatasource': {
            'Meta': {'object_name': 'ModsFileDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'diagnostics': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'})
        },
        'upload.modsurldatasource': {
            'Meta': {'object_name': 'ModsURLDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'diagnostics': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'upload.oaidatasource': {
            'Meta': {'object_name': 'OAIDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'limit': ('django.db.models.fields.IntegerField', [], {'default': "'100'"}),
            'set': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'upload.urldatasource': {
            'Meta': {'object_name': 'URLDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['upload']