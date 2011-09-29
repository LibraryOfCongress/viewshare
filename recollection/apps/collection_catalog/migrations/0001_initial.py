
from south.db import db
from django.db import models
from recollection.apps.collection_catalog.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'Collection'
        db.create_table('collection_catalog_collection', (
            ('id', orm['collection_catalog.Collection:id']),
            ('name', orm['collection_catalog.Collection:name']),
            ('slug', orm['collection_catalog.Collection:slug']),
            ('description', orm['collection_catalog.Collection:description']),
            ('url', orm['collection_catalog.Collection:url']),
            ('thumbnail', orm['collection_catalog.Collection:thumbnail']),
            ('project', orm['collection_catalog.Collection:project']),
            ('topic', orm['collection_catalog.Collection:topic']),
            ('enabled', orm['collection_catalog.Collection:enabled']),
        ))
        db.send_create_signal('collection_catalog', ['Collection'])
        
        # Adding model 'Topic'
        db.create_table('collection_catalog_topic', (
            ('id', orm['collection_catalog.Topic:id']),
            ('name', orm['collection_catalog.Topic:name']),
            ('slug', orm['collection_catalog.Topic:slug']),
        ))
        db.send_create_signal('collection_catalog', ['Topic'])
        
        # Adding model 'Organization'
        db.create_table('collection_catalog_organization', (
            ('id', orm['collection_catalog.Organization:id']),
            ('name', orm['collection_catalog.Organization:name']),
            ('slug', orm['collection_catalog.Organization:slug']),
            ('description', orm['collection_catalog.Organization:description']),
            ('location', orm['collection_catalog.Organization:location']),
        ))
        db.send_create_signal('collection_catalog', ['Organization'])
        
        # Adding model 'Project'
        db.create_table('collection_catalog_project', (
            ('id', orm['collection_catalog.Project:id']),
            ('name', orm['collection_catalog.Project:name']),
            ('slug', orm['collection_catalog.Project:slug']),
            ('description', orm['collection_catalog.Project:description']),
        ))
        db.send_create_signal('collection_catalog', ['Project'])
        
        # Adding ManyToManyField 'Project.organizations'
        db.create_table('collection_catalog_project_organizations', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('project', models.ForeignKey(orm.Project, null=False)),
            ('organization', models.ForeignKey(orm.Organization, null=False))
        ))
        
        # Adding ManyToManyField 'Collection.data_sets'
        db.create_table('collection_catalog_collection_data_sets', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('collection', models.ForeignKey(orm.Collection, null=False)),
        ))
        
    
    
    def backwards(self, orm):
        
        # Deleting model 'Collection'
        db.delete_table('collection_catalog_collection')
        
        # Deleting model 'Topic'
        db.delete_table('collection_catalog_topic')
        
        # Deleting model 'Organization'
        db.delete_table('collection_catalog_organization')
        
        # Deleting model 'Project'
        db.delete_table('collection_catalog_project')
        
        # Dropping ManyToManyField 'Project.organizations'
        db.delete_table('collection_catalog_project_organizations')
        
        # Dropping ManyToManyField 'Collection.data_sets'
        db.delete_table('collection_catalog_collection_data_sets')
        
    
    
    models = {
        'auth.group': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'unique_together': "(('content_type', 'codename'),)"},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'collection_catalog.collection': {
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'enabled': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'project': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['collection_catalog.Project']"}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'}),
            'thumbnail': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'topic': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['collection_catalog.Topic']"}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'collection_catalog.organization': {
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '30', 'db_index': 'True'})
        },
        'collection_catalog.project': {
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'organizations': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['collection_catalog.Organization']"}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '30', 'db_index': 'True'})
        },
        'collection_catalog.topic': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '30', 'db_index': 'True'})
        },
        'contenttypes.contenttype': {
            'Meta': {'unique_together': "(('app_label', 'model'),)", 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }

    }
    
    complete_apps = ['collection_catalog']
