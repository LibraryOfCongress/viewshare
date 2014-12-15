# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    depends_on = (
        ('exhibit', '0026_auto__add_field_datatransaction_result'),
    )

    def forwards(self, orm):
        # Removing unique constraint on 'Dataset', fields ['slug', 'owner']
        db.delete_unique(u'dataset_dataset', ['slug', 'owner_id'])

        # Deleting model 'Dataset'
        db.delete_table(u'dataset_dataset')

        # Deleting model 'DataSourceTransaction'
        db.delete_table(u'dataset_datasourcetransaction')

        # Deleting model 'DataSource'
        db.delete_table(u'dataset_datasource')


    def backwards(self, orm):
        # Adding model 'Dataset'
        db.create_table(u'dataset_dataset', (
            ('slug', self.gf('django_extensions.db.fields.AutoSlugField')(populate_from='title', allow_duplicates=False, max_length=50, separator=u'-', blank=True, overwrite=False)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(related_name='datasets', null=True, to=orm['auth.User'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('published', self.gf('django.db.models.fields.BooleanField')(default=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('modified', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
        ))
        db.send_create_signal(u'dataset', ['Dataset'])

        # Adding unique constraint on 'Dataset', fields ['slug', 'owner']
        db.create_unique(u'dataset_dataset', ['slug', 'owner_id'])

        # Adding model 'DataSourceTransaction'
        db.create_table(u'dataset_datasourcetransaction', (
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(related_name='transactions', to=orm['dataset.DataSource'])),
            ('result', self.gf('django.db.models.fields.TextField')(default='{}', null=True, blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('tx_id', self.gf('django.db.models.fields.CharField')(max_length=36, blank=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('modified', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('is_complete', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'dataset', ['DataSourceTransaction'])

        # Adding model 'DataSource'
        db.create_table(u'dataset_datasource', (
            ('classname', self.gf('django.db.models.fields.CharField')(max_length=32, null=True)),
            ('exhibit', self.gf('django.db.models.fields.related.OneToOneField')(related_name='ds_source', unique=True, null=True, to=orm['exhibit.Exhibit'], blank=True)),
            ('uuid', self.gf('django.db.models.fields.CharField')(max_length=36, blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(related_name='data_sources', null=True, to=orm['auth.User'], blank=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('modified', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now, blank=True)),
            ('dataset', self.gf('django.db.models.fields.related.OneToOneField')(related_name='source', unique=True, null=True, to=orm['dataset.Dataset'], blank=True)),
        ))
        db.send_create_signal(u'dataset', ['DataSource'])


    models = {
        
    }

    complete_apps = ['dataset']
