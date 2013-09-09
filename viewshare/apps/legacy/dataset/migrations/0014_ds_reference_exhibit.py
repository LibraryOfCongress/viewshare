# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    depends_on = (
        ("exhibit", "0014_populate_profile"),
    )

    def forwards(self, orm):
        """
        Ensure existing data sources point to an exhibit owned by the
        correct owner.  This is dependent on exhibit migration 0014, after
        which all datasets have exhibits.
        """
        for source in orm['dataset.DataSource'].objects.filter(dataset__isnull=False):
            ds = source.dataset
            exhibit = ds.exhibits.filter(publishedexhibit__owner=ds.owner)[0]
            source.exhibit = exhibit
            source.save()


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
        u'dataset.datasetjsonfile': {
            'Meta': {'object_name': 'DatasetJSONFile'},
            'data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'data'", 'unique': 'True', 'to': u"orm['dataset.Dataset']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'dataset.datasetprofile': {
            'Meta': {'object_name': 'DatasetProfile'},
            'data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'profile'", 'unique': 'True', 'to': u"orm['dataset.Dataset']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'dataset.datasetpropertiescache': {
            'Meta': {'object_name': 'DatasetPropertiesCache'},
            'data': ('django.db.models.fields.TextField', [], {'default': "'{}'"}),
            'dataset': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'properties_cache'", 'unique': 'True', 'to': u"orm['dataset.Dataset']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
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
        u'dataset.datasourcetransaction': {
            'Meta': {'ordering': "('-modified', '-created')", 'object_name': 'DataSourceTransaction'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_complete': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'modified': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now', 'blank': 'True'}),
            'result': ('django.db.models.fields.TextField', [], {'default': "'{}'", 'null': 'True', 'blank': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'transactions'", 'to': u"orm['dataset.DataSource']"}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'tx_id': ('django.db.models.fields.CharField', [], {'max_length': '36', 'blank': 'True'})
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

    complete_apps = ['dataset']
    symmetrical = True
