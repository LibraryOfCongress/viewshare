# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'ModsURLDataSource.datasource_ptr'
        db.delete_column(u'upload_modsurldatasource', u'datasource_ptr_id')


        # Changing field 'ModsURLDataSource.new_ds_ptr'
        db.alter_column(u'upload_modsurldatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'OAIDataSource.datasource_ptr'
        db.delete_column(u'upload_oaidatasource', u'datasource_ptr_id')


        # Changing field 'OAIDataSource.new_ds_ptr'
        db.alter_column(u'upload_oaidatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'URLDataSource.datasource_ptr'
        db.delete_column(u'upload_urldatasource', u'datasource_ptr_id')


        # Changing field 'URLDataSource.new_ds_ptr'
        db.alter_column(u'upload_urldatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'JSONFileDataSource.datasource_ptr'
        db.delete_column(u'upload_jsonfiledatasource', u'datasource_ptr_id')


        # Changing field 'JSONFileDataSource.new_ds_ptr'
        db.alter_column(u'upload_jsonfiledatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'ContentDMDataSource.datasource_ptr'
        db.delete_column(u'upload_contentdmdatasource', u'datasource_ptr_id')


        # Changing field 'ContentDMDataSource.new_ds_ptr'
        db.alter_column(u'upload_contentdmdatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'JSONURLDataSource.datasource_ptr'
        db.delete_column(u'upload_jsonurldatasource', u'datasource_ptr_id')


        # Changing field 'JSONURLDataSource.new_ds_ptr'
        db.alter_column(u'upload_jsonurldatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'FileDataSource.datasource_ptr'
        db.delete_column(u'upload_filedatasource', u'datasource_ptr_id')


        # Changing field 'FileDataSource.new_ds_ptr'
        db.alter_column(u'upload_filedatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'ModsFileDataSource.datasource_ptr'
        db.delete_column(u'upload_modsfiledatasource', u'datasource_ptr_id')


        # Changing field 'ModsFileDataSource.new_ds_ptr'
        db.alter_column(u'upload_modsfiledatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))
        # Deleting field 'ReferenceDataSource.datasource_ptr'
        db.delete_column(u'upload_referencedatasource', u'datasource_ptr_id')


        # Changing field 'ReferenceDataSource.new_ds_ptr'
        db.alter_column(u'upload_referencedatasource', 'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, primary_key=True))

    def backwards(self, orm):

        # Changing field 'ModsURLDataSource.new_ds_ptr'
        db.alter_column(u'upload_modsurldatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'OAIDataSource.datasource_ptr'
        db.add_column(u'upload_oaidatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'OAIDataSource.new_ds_ptr'
        db.alter_column(u'upload_oaidatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'URLDataSource.datasource_ptr'
        db.add_column(u'upload_urldatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'URLDataSource.new_ds_ptr'
        db.alter_column(u'upload_urldatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'JSONFileDataSource.datasource_ptr'
        db.add_column(u'upload_jsonfiledatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'JSONFileDataSource.new_ds_ptr'
        db.alter_column(u'upload_jsonfiledatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'ContentDMDataSource.datasource_ptr'
        db.add_column(u'upload_contentdmdatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'ContentDMDataSource.new_ds_ptr'
        db.alter_column(u'upload_contentdmdatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'JSONURLDataSource.datasource_ptr'
        db.add_column(u'upload_jsonurldatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'JSONURLDataSource.new_ds_ptr'
        db.alter_column(u'upload_jsonurldatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'FileDataSource.datasource_ptr'
        db.add_column(u'upload_filedatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'FileDataSource.new_ds_ptr'
        db.alter_column(u'upload_filedatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'ModsFileDataSource.datasource_ptr'
        db.add_column(u'upload_modsfiledatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'ModsFileDataSource.new_ds_ptr'
        db.alter_column(u'upload_modsfiledatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))
        # Adding field 'ReferenceDataSource.datasource_ptr'
        db.add_column(u'upload_referencedatasource', u'datasource_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dataset.DataSource'], unique=True, primary_key=True),
                      keep_default=False)


        # Changing field 'ReferenceDataSource.new_ds_ptr'
        db.alter_column(u'upload_referencedatasource', u'new_ds_ptr_id', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['upload.DataSource'], unique=True, null=True))

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
        u'dataset.dataset': {
            'Meta': {'ordering': "('-modified',)", 'unique_together': "(('slug', 'owner'),)", 'object_name': 'Dataset'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'datasets'", 'null': 'True', 'to': u"orm['auth.User']"}),
            'published': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'slug': ('django_extensions.db.fields.AutoSlugField', [], {'allow_duplicates': 'False', 'max_length': '50', 'separator': "u'-'", 'blank': 'True', 'populate_from': "'title'", 'overwrite': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
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
        u'exhibit.exhibit': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'Exhibit'},
            'canvas': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['exhibit.Canvas']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'dataset': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'exhibits'", 'null': 'True', 'to': u"orm['dataset.Dataset']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'profile': ('django.db.models.fields.TextField', [], {'default': "'{}'"})
        },
        u'upload.contentdmdatasource': {
            'Meta': {'object_name': 'ContentDMDataSource'},
            'collection': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'limit': ('django.db.models.fields.IntegerField', [], {'default': "'100'"}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'query': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.datasource': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'DataSource'},
            'classname': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'exhibit': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'source'", 'unique': 'True', 'to': u"orm['exhibit.Exhibit']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'})
        },
        u'upload.filedatasource': {
            'Meta': {'object_name': 'FileDataSource'},
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'upload.jsonfiledatasource': {
            'Meta': {'object_name': 'JSONFileDataSource'},
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            'mapping': ('django.db.models.fields.TextField', [], {}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'path': ('django.db.models.fields.TextField', [], {})
        },
        u'upload.jsonurldatasource': {
            'Meta': {'object_name': 'JSONURLDataSource'},
            'mapping': ('django.db.models.fields.TextField', [], {}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'path': ('django.db.models.fields.TextField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.modsfiledatasource': {
            'Meta': {'object_name': 'ModsFileDataSource'},
            'diagnostics': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'upload.modsurldatasource': {
            'Meta': {'object_name': 'ModsURLDataSource'},
            'diagnostics': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.oaidatasource': {
            'Meta': {'object_name': 'OAIDataSource'},
            'limit': ('django.db.models.fields.IntegerField', [], {'default': "'100'"}),
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'set': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.referencedatasource': {
            'Meta': {'object_name': 'ReferenceDataSource'},
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'referenced': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'references'", 'to': u"orm['exhibit.Exhibit']"})
        },
        u'upload.urldatasource': {
            'Meta': {'object_name': 'URLDataSource'},
            'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['upload']