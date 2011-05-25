# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):

        # Adding model 'BrowserPickListItem'
        db.create_table('support_browserpicklistitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('value', self.gf('django.db.models.fields.CharField')(unique=True, max_length=100)),
            ('key', self.gf('django.db.models.fields.SlugField')(db_index=True, max_length=50, blank=True)),
        ))
        db.send_create_signal('support', ['BrowserPickListItem'])

        # Adding model 'FileFormatPickListItem'
        db.create_table('support_fileformatpicklistitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('value', self.gf('django.db.models.fields.CharField')(unique=True, max_length=100)),
            ('key', self.gf('django.db.models.fields.SlugField')(db_index=True, max_length=50, blank=True)),
        ))
        db.send_create_signal('support', ['FileFormatPickListItem'])

        # Adding model 'DataLoadReasonPickListItem'
        db.create_table('support_dataloadreasonpicklistitem', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('value', self.gf('django.db.models.fields.CharField')(unique=True, max_length=100)),
            ('key', self.gf('django.db.models.fields.SlugField')(db_index=True, max_length=50, blank=True)),
        ))
        db.send_create_signal('support', ['DataLoadReasonPickListItem'])


    def backwards(self, orm):

        # Deleting model 'BrowserPickListItem'
        db.delete_table('support_browserpicklistitem')

        # Deleting model 'FileFormatPickListItem'
        db.delete_table('support_fileformatpicklistitem')

        # Deleting model 'DataLoadReasonPickListItem'
        db.delete_table('support_dataloadreasonpicklistitem')


    models = {
        'support.browserpicklistitem': {
            'Meta': {'object_name': 'BrowserPickListItem'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'blank': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        'support.dataloadreasonpicklistitem': {
            'Meta': {'object_name': 'DataLoadReasonPickListItem'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'blank': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        'support.fileformatpicklistitem': {
            'Meta': {'object_name': 'FileFormatPickListItem'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'blank': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        }
    }

    complete_apps = ['support']
