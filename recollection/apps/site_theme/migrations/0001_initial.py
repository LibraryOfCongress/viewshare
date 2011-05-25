# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'SiteTheme'
        db.create_table('site_theme_sitetheme', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(unique=True, max_length=100, db_index=True)),
            ('name', self.gf('django.db.models.fields.CharField')(default='Label', max_length=30)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=200, null=False, blank=False, default='/site_media/static/site_theme/css/default/base.css')),
        ))
        db.send_create_signal('site_theme', ['SiteTheme'])

        # Adding model 'Skin'
        db.create_table('site_theme_skin', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('site', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['sites.Site'])),
            ('theme', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['site_theme.SiteTheme'])),
        ))
        db.send_create_signal('site_theme', ['Skin'])


    def backwards(self, orm):
        
        # Deleting model 'SiteTheme'
        db.delete_table('site_theme_sitetheme')

        # Deleting model 'Skin'
        db.delete_table('site_theme_skin')


    models = {
        'site_theme.sitetheme': {
            'Meta': {'object_name': 'SiteTheme'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Label'", 'max_length': '30'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'}),
            'url': ('django.db.models.fields.CharField', [], {'default': "'/site_media/static/site_theme/css/default/base.css'", 'max_length': '200', 'null': 'False', 'blank': 'False'})
        },
        'site_theme.skin': {
            'Meta': {'object_name': 'Skin'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'site': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['sites.Site']"}),
            'theme': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['site_theme.SiteTheme']"})
        },
        'sites.site': {
            'Meta': {'object_name': 'Site', 'db_table': "'django_site'"},
            'domain': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['site_theme']
