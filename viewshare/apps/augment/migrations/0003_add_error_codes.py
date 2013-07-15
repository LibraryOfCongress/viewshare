# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'AugmentationErrorCode'
        db.create_table('augment_augmentationerrorcode', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('error', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
        ))
        db.send_create_signal('augment', ['AugmentationErrorCode'])


    def backwards(self, orm):
        
        # Deleting model 'AugmentationErrorCode'
        db.delete_table('augment_augmentationerrorcode')


    models = {
        'augment.augmentationerrorcode': {
            'Meta': {'object_name': 'AugmentationErrorCode'},
            'error': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'augment.listpattern': {
            'Meta': {'object_name': 'ListPattern'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'pattern': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '30'})
        }
    }

    complete_apps = ['augment']
