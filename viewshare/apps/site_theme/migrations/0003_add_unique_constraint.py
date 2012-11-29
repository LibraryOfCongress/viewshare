# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Changing field 'SiteTheme.url'
        db.alter_column('site_theme_sitetheme', 'url', self.gf('django.db.models.fields.CharField')(max_length=200))

        # Adding unique constraint on 'Skin', fields ['theme', 'site']
        db.create_unique('site_theme_skin', ['theme_id', 'site_id'])


    def backwards(self, orm):
        
        # Removing unique constraint on 'Skin', fields ['theme', 'site']
        db.delete_unique('site_theme_skin', ['theme_id', 'site_id'])

        # Changing field 'SiteTheme.url'
        db.alter_column('site_theme_sitetheme', 'url', self.gf('django.db.models.fields.CharField')(max_length=200, null=False))


    models = {
        'site_theme.sitetheme': {
            'Meta': {'object_name': 'SiteTheme'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Label'", 'max_length': '30'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100', 'db_index': 'True'}),
            'url': ('django.db.models.fields.CharField', [], {'default': "'/site_media/static/site_theme/css/default/base.css'", 'max_length': '200'})
        },
        'site_theme.skin': {
            'Meta': {'unique_together': "(('site', 'theme'),)", 'object_name': 'Skin'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'site': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['sites.Site']"}),
            'theme': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['site_theme.SiteTheme']"})
        },
        'sites.site': {
            'Meta': {'ordering': "('domain',)", 'object_name': 'Site', 'db_table': "'django_site'"},
            'domain': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        }
    }

    complete_apps = ['site_theme']
