# encoding: utf-8
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):
    depends_on= [
        ('augment', '0003_add_error_codes',),
    ]
    def forwards(self, orm):
        from django.core.management import call_command
        call_command("loaddata", "augmentation_errors")



    def backwards(self, orm):
        "Write your backwards methods here."


    models = {

    }

    complete_apps = ['recollection_defaults']
