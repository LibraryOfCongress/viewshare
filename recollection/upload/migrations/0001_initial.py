# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'URLDataSource'
        db.create_table('upload_urldatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
        ))
        db.send_create_signal('upload', ['URLDataSource'])

        # Adding model 'FileDataSource'
        db.create_table('upload_filedatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('file', self.gf('django.db.models.fields.files.FileField')(max_length=255)),
        ))
        db.send_create_signal('upload', ['FileDataSource'])

        # Adding model 'ContentDMDataSource'
        db.create_table('upload_contentdmdatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('collection', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('query', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('limit', self.gf('django.db.models.fields.IntegerField')(default='100')),
        ))
        db.send_create_signal('upload', ['ContentDMDataSource'])

        # Adding model 'ModsURLDataSource'
        db.create_table('upload_modsurldatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('diagnostics', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('upload', ['ModsURLDataSource'])

        # Adding model 'ModsFileDataSource'
        db.create_table('upload_modsfiledatasource', (
            ('datasource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True)),
            ('file', self.gf('django.db.models.fields.files.FileField')(max_length=255)),
            ('diagnostics', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('upload', ['ModsFileDataSource'])


    def backwards(self, orm):
        
        # Deleting model 'URLDataSource'
        db.delete_table('upload_urldatasource')

        # Deleting model 'FileDataSource'
        db.delete_table('upload_filedatasource')

        # Deleting model 'ContentDMDataSource'
        db.delete_table('upload_contentdmdatasource')

        # Deleting model 'ModsURLDataSource'
        db.delete_table('upload_modsurldatasource')

        # Deleting model 'ModsFileDataSource'
        db.delete_table('upload_modsfiledatasource')


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
        'dataset.datasource': {
            'Meta': {'object_name': 'DataSource'},
            'classname': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'data_sources'", 'to': "orm['auth.User']"}),
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
        'upload.urldatasource': {
            'Meta': {'object_name': 'URLDataSource', '_ormbases': ['dataset.DataSource']},
            'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['upload']
