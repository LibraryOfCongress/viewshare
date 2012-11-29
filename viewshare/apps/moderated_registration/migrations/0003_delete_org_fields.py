# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Deleting field 'ViewShareRegistrationProfile.org_type'
        db.delete_column('moderated_registration_viewshareregistrationprofile', 'org_type')

        # Deleting field 'ViewShareRegistrationProfile.reason'
        db.delete_column('moderated_registration_viewshareregistrationprofile', 'reason')

        # Deleting field 'ViewShareRegistrationProfile.organization'
        db.delete_column('moderated_registration_viewshareregistrationprofile', 'organization')

        # Deleting field 'ViewShareRegistrationProfile.org_state'
        db.delete_column('moderated_registration_viewshareregistrationprofile', 'org_state')


    def backwards(self, orm):
        
        # Adding field 'ViewShareRegistrationProfile.org_type'
        db.add_column('moderated_registration_viewshareregistrationprofile', 'org_type', self.gf('django.db.models.fields.CharField')(default='void', max_length=100), keep_default=False)

        # Adding field 'ViewShareRegistrationProfile.reason'
        db.add_column('moderated_registration_viewshareregistrationprofile', 'reason', self.gf('django.db.models.fields.TextField')(default='void'), keep_default=False)

        # Adding field 'ViewShareRegistrationProfile.organization'
        db.add_column('moderated_registration_viewshareregistrationprofile', 'organization', self.gf('django.db.models.fields.CharField')(default='void', max_length=100), keep_default=False)

        # Adding field 'ViewShareRegistrationProfile.org_state'
        db.add_column('moderated_registration_viewshareregistrationprofile', 'org_state', self.gf('django.contrib.localflavor.us.models.USStateField')(default='', max_length=2, blank=True), keep_default=False)


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
        'moderated_registration.organizationtype': {
            'Meta': {'object_name': 'OrganizationType'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'key': ('django.db.models.fields.SlugField', [], {'db_index': 'True', 'max_length': '50', 'blank': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        'moderated_registration.viewshareregistrationprofile': {
            'Meta': {'object_name': 'ViewShareRegistrationProfile'},
            'is_approved': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'registrationprofile_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['registration.RegistrationProfile']", 'unique': 'True', 'primary_key': 'True'})
        },
        'registration.registrationprofile': {
            'Meta': {'object_name': 'RegistrationProfile'},
            'activation_key': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'unique': 'True'})
        }
    }

    complete_apps = ['moderated_registration']
