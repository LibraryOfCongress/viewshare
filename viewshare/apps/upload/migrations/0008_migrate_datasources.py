# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models
source_types = (
    "upload.FileDataSource",
    "upload.jsonfiledatasource",
    "upload.contentdmdatasource",
    "upload.jsonurldatasource",
    "upload.modsfiledatasource",
    "upload.modsurldatasource",
    "upload.oaidatasource",
    "upload.referencedatasource",
    "upload.urldatasource"


)

def migrate_datasource(ds):
    source = orm["upload.DataSource"](
        classname=ds.classname,
        created=ds.created,
        exhibit=ds.exhibit,
        modified=ds.modified
    )
    source.save()
    ds.new_ds_ptr=source
    ds.save()

class Migration(DataMigration):

    def forwards(self, orm):
        """
        Migrate data sources from dataset to upload app by iterating over
        exhibits and pointing to their data sources, so orphaned data sources
        aren't migrated.
        """
        for t in source_types:
            for ds in orm[t].objects.filter(exhibit__isnull=False):
                source = orm["upload.DataSource"](
                    classname=ds.classname,
                    created=ds.created,
                    exhibit=ds.exhibit,
                    modified=ds.modified
                )
                source.save()
                ds.new_ds_ptr=source
                ds.save()

        for ds in orm["dataset.datasource"].objects.filter(classname="DataSource", exhibit__isnull=False):
            source = orm["upload.DataSource"](
                classname=ds.classname,
                created=ds.created,
                exhibit=ds.exhibit,
                modified=ds.modified
            )
            source.save()

        orm["dataset.datasource"].objects.filter(exhibit__isnull=True).delete()

    def backwards(self, orm):
        "Write your backwards methods here."

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
        u'dataset.datasource': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'DataSource'},
            'classname': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'source'", 'unique': 'True', 'null': 'True', 'to': u"orm['dataset.Dataset']"}),
            'exhibit': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'ds_source'", 'unique': 'True', 'null': 'True', 'to': u"orm['exhibit.Exhibit']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'data_sources'", 'null': 'True', 'to': u"orm['auth.User']"}),
            'uuid': ('django.db.models.fields.CharField', [], {'max_length': '36', 'blank': 'True'})
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
            'Meta': {'object_name': 'ContentDMDataSource', '_ormbases': [u'dataset.DataSource']},
            'collection': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'limit': ('django.db.models.fields.IntegerField', [], {'default': "'100'"}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
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
            'Meta': {'object_name': 'FileDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'})
        },
        u'upload.jsonfiledatasource': {
            'Meta': {'object_name': 'JSONFileDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            'mapping': ('django.db.models.fields.TextField', [], {}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
            'path': ('django.db.models.fields.TextField', [], {})
        },
        u'upload.jsonurldatasource': {
            'Meta': {'object_name': 'JSONURLDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'mapping': ('django.db.models.fields.TextField', [], {}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
            'path': ('django.db.models.fields.TextField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.modsfiledatasource': {
            'Meta': {'object_name': 'ModsFileDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'diagnostics': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'})
        },
        u'upload.modsurldatasource': {
            'Meta': {'object_name': 'ModsURLDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'diagnostics': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.oaidatasource': {
            'Meta': {'object_name': 'OAIDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            'limit': ('django.db.models.fields.IntegerField', [], {'default': "'100'"}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
            'set': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'upload.referencedatasource': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'ReferenceDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
            'referenced': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'references'", 'to': u"orm['exhibit.Exhibit']"})
        },
        u'upload.urldatasource': {
            'Meta': {'object_name': 'URLDataSource', '_ormbases': [u'dataset.DataSource']},
            u'datasource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dataset.DataSource']", 'unique': 'True', 'primary_key': 'True'}),
            u'new_ds_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['upload.DataSource']", 'unique': 'True', 'null': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['upload']
    symmetrical = True
