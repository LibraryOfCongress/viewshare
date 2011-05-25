# encoding: utf-8
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    depends_on= []
    def forwards(self, orm):
        pass

    def backwards(self, orm):
        "Write your backwards methods here."


    models = {
    }

    complete_apps = ['recollection_defaults']
