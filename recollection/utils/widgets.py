from django import forms
from django.conf import settings
from django.utils.safestring import mark_safe
from django.utils.text import truncate_words
from django_extensions.admin import ForeignKeyAutocompleteAdmin

from django.template.loader import render_to_string
from django.conf.urls.defaults import patterns

class ManyToManySearchInput(forms.SelectMultiple):
    class Media:
        css = {
            'all': (settings.STATIC_URL+'django_extensions/css/jquery.autocomplete.css',)
        }
        js = (
            settings.STATIC_URL+'django_extensions/js/jquery.js',
            settings.STATIC_URL+'django_extensions/js/jquery.bgiframe.min.js',
            settings.STATIC_URL+'django_extensions/js/jquery.ajaxQueue.js',
            settings.STATIC_URL+'django_extensions/js/jquery.autocomplete.js'
        )

    def label_for_value(self, value):
        return ''

    def __init__(self, rel, db_field_name, to_string_function, attrs=None):
        self.rel = rel
        self.db_field_name = db_field_name
        # self.search_fields = search_fields
        self.to_string_function = to_string_function
        super(ManyToManySearchInput, self).__init__(attrs)

    def render(self, name, value, attrs=None):
        #print name, value[0], self.rel
        #rendered = super(ManyToManySearchInput, self).render(name,value,  attrs)
        
        model_name = self.rel.to._meta.module_name
        app_label = self.rel.to._meta.app_label
        related_url = '../../../%s/%s/' % (app_label, model_name)

        url = ''
        
        if value:
            label = self.label_for_value(value)
        else:
            label = u''
        ul=""
        select=''
        ToModel=self.rel.to
        if not value:value=[]
        for val in value:
            obj=ToModel.objects.get(pk=val)
            ul+="<li id='%(pk)s'><div class='object_repr'>%(repr)s</div><div class='delete_from_m2m'><a style='cursor:pointer'><img src='%(admin_media_prefix)simg/admin/icon_deletelink.gif' /></a></div></li>"%{'admin_media_prefix': settings.ADMIN_MEDIA_PREFIX,
                        'repr':self.to_string_function(obj), 
                        'pk':str(obj.pk)}
            select+='<option id="%(pk)s" value="%(pk)s" selected="selected">%(repr)s</option>'%{'admin_media_prefix': settings.ADMIN_MEDIA_PREFIX,
                        'repr':self.to_string_function(obj), 
                        'pk':str(obj.pk)}
        return render_to_string("autocomplete/autocomplete.html",{
                            'url': url,
                            'related_url': related_url,
                            'db_field_name': self.db_field_name,
                            'admin_media_prefix': settings.ADMIN_MEDIA_PREFIX,
                            'model_name': model_name,
                            'app_label': app_label,
                            'label': label,
                            'name': name,
                            'ul': mark_safe(ul), 
                            'select':mark_safe(select), 
                            'plural': self.rel.to._meta.verbose_name_plural
                        })                

        
import operator
from django.db import models
from django.contrib.auth.models import Message
from django.http import HttpResponse, HttpResponseNotFound
from django.contrib import admin
from django.db.models.query import QuerySet
from django.utils.encoding import smart_str


class AutocompleteAdmin(ForeignKeyAutocompleteAdmin):

    def get_urls(self):
        urls = super(AutocompleteAdmin,self).get_urls()
        search_url = patterns('',
            (r'^search/$', self.search)
            )
        return search_url + urls



    def to_string_function(self, model_name):
        try:
            return self.related_string_functions[model_name]
        except KeyError:
            return lambda x: x.__unicode__()
            
    def search(self, request):
        query = request.GET.get('q', None)
        id = request.GET.get('id', None)
        app_label = request.GET.get('app_label', None)
        model_name = request.GET.get('model_name', None)
        db_field_name = request.GET.get('db_field_name', None)
        search_fields = self.related_search_fields[db_field_name]

        if search_fields and app_label and model_name and query:
            def construct_search(field_name):
                # use different lookup methods depending on the notation
                if field_name.startswith('^'):
                    return "%s__istartswith" % field_name[1:]
                elif field_name.startswith('='):
                    return "%s__iexact" % field_name[1:]
                elif field_name.startswith('@'):
                    return "%s__search" % field_name[1:]
                else:
                    return "%s__icontains" % field_name

            model = models.get_model(app_label, model_name)
            try:
                if id:
                
                    qs = model.objects.filter(id=query)
                else:
                    qs = model._default_manager.all()

                    for bit in query.split():
                        or_queries = [models.Q(**{construct_search(
                            smart_str(field_name)): smart_str(bit)})
                                for field_name in search_fields]
                        other_qs = QuerySet(model)
                        other_qs.dup_select_related(qs)
                        other_qs = other_qs.filter(reduce(operator.or_, or_queries))
                        qs = qs & other_qs
            except:
                qs = ()
            data = ''.join([u'%s|%s\n' % (self.to_string_function(db_field_name)(f), f.pk) for f in qs])
            return HttpResponse(data)
        return HttpResponseNotFound()

    def formfield_for_dbfield(self, db_field, **kwargs):
        if isinstance(db_field, models.ManyToManyField) and db_field.name in self.related_search_fields:
            # kwargs['widget']= ManyToManySearchInput(db_field.rel, self.related_search_fields[db_field.name], self.to_string_function(db_field.name))
            kwargs['widget'] = ManyToManySearchInput(db_field.rel, db_field.name, self.to_string_function(db_field.name))
            kwargs['help_text'] = ''
        return super(AutocompleteAdmin, self).formfield_for_dbfield(db_field, **kwargs)
