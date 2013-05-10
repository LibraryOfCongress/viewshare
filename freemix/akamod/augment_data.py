#!/usr/bin/env python
# encoding: utf-8
"""
Copyright 2008-2011 Zepheira LLC

Services for data augmentation

This file is part of the open source Freemix project,
provided under the Apache 2.0 license.
See the files LICENSE and NOTICE for details.
Project home, documentation, distributions: http://foundry.zepheira.com/projects/zen

= Defined REST entry points =


= Configuration =


Sample config:

class augment_data:
    geonames_dbfile = 'path/to/geonames.sqlite3'
    #e.g.: geonames_dbfile = Akara.ConfigRoot+'/caches/geonames.sqlite3'

= Notes on security =

To-do


"""

import sys, re, os, time
from functools import *
from itertools import *
from operator import *
from contextlib import closing

from amara.thirdparty import json, httplib2

from akara.services import simple_service
from akara import logger
from akara import response
from akara.caching import cache, make_named_cache
from akara import module_config

from zen.services import service_proxy
from zen import augmentation
from zen.akamod import geolookup_service
#from zen.geo import local_geonames, US_STATE_FIRST


GEONAMES_PLUS_DBFILE = module_config().get('geonames_dbfile')

CHUNKCOUNT = 10

UNSUPPORTED_IN_EXHIBITKEY = re.compile('\W')

EXHIBIT_RESERVED = ['label', 'id', 'type']

#GEOLOOKUP_CACHE = cache('http://purl.org/com/zepheira/services/geolookup.json', expires=24*60*60)

def post(body, sink):
    headers = {'Content-type' : 'application/json'}
    h = httplib2.Http()
    resp, content = h.request(sink, "POST", body=body, headers=headers)
    return resp, content


AUGMENTATIONS = {
    u'location': u'http://purl.org/com/zepheira/augmentation/location',
    u'date': u'http://purl.org/com/zepheira/augmentation/datetime',
    u'luckygoogle': u'http://purl.org/com/zepheira/augmentation/luckygoogle',
    u'shredded_list': u'http://purl.org/com/zepheira/augmentation/shredded-list',
}

augmentation.GEOCODER = geolookup_service()
#augmentation.GEOCODER = local_geonames(GEONAMES_PLUS_DBFILE, heuristics=[US_STATE_FIRST], logger=logger)

PROP_TYPE_MARKER = "property:type="
PROP_TYPE_MARKER_LEN = len("property:type=")

SERVICE_ID = 'http://purl.org/com/zepheira/services/augment.freemix.json'
@simple_service('POST', SERVICE_ID, 'augment.freemix.json', 'application/json')
def augment_freemix(body, ctype):
    #See: http://foundry.zepheira.com/issues/133#note-4
    '''
    Render the contents of a file as best as possible in Exhibit JSON
    * Supports Excel, BibTex and JSON for now

    Sample queries:
    * curl "http://localhost:8880/augment.freemix.json?source=file:///tmp/foo.js&sink=http://localhost:8880/testsink.json"
    * curl --request POST --data-binary "@foo.xls" --header "Content-Type: application/vnd.ms-excel" "http://localhost:8880/freemix.json"
    '''
    fixup_obj_labels = True
    obj = json.loads(body)
    dataprofile = obj['data_profile']
    objkeys = {}
    source = obj[u'items']
    augmented_items = []
    failed_items = {}

    for prop in dataprofile["properties"]:
        if not prop["enabled"]: continue
        prop_types = [ t[PROP_TYPE_MARKER_LEN:] for t in prop["tags"] if t.startswith(PROP_TYPE_MARKER) ]
        #logger.debug("PROPERTY TYPES: " + repr(prop_types))
        if prop_types:
            for aug, sid in AUGMENTATIONS.items():
                handler = service_proxy(sid)
                if aug in prop_types and (u"composite" in prop or aug == u'shredded_list'):
                    handler(source, prop, augmented_items, failed_items)
        #logger.debug('AUGMENTATION: ' + repr((prop['property'], augmented_items)))

    #Inefficiency of creating a dict only to get its values
    response = {'items': augmented_items, 'failed': failed_items}
    return json.dumps(response, indent=4)


SERVICE_ID = 'http://purl.org/com/zepheira/services/mix.freemix.json'
@simple_service('POST', SERVICE_ID, 'mix.freemix.json', 'application/json')
def mix_freemix(body, ctype):
    #See: http://foundry.zepheira.com/issues/137#note-10
    '''
    {
      "datasets": {
        "dataset1": "http://recollection.zepheira.com/data/guide/data-profile-arthur-y-ford-photograph-albums-reprise-for-demo/data.json",
        "dataset2": "http://recollection.zepheira.com/data/guide/jean-thomas-collection/data.json"
      },
      "alignProperties": {
        "label": "Name",
        "dataset1": "Surname",
        "dataset2": "Name_of_Candidate"
      }
    }
    '''
    USER, PASSWD = "loc", "recollection"
    cache_dir = make_named_cache('mix.freemix.json')
    H = httplib2.Http(cache_dir)
    if USER:
        H.add_credentials(USER, PASSWD)
    request = json.loads(body)
    datasets = request['datasets']
    alignments = request.get('alignProperties')

    if len(datasets) != 2:
        raise ValueError('You must provide Mixer exactly 2 data sets')

    if alignments:
        mixed = []
        for dataset in datasets:
            #Replace the data set URL with the content
            logger.debug("Processing dataset: %s" % (datasets[dataset]))
            resp, content = H.request(datasets[dataset])
            items = json.loads(content)[u'items']
            prop = alignments[dataset]
            newprop_label = alignments['label']
            #Potluck (the usual mixer client) seems to generate property names such as
            #"Activity / Activity" which Exhibit cannot handle. Work around that.
            #See: http://foundry.zepheira.com/issues/334
            newprop = UNSUPPORTED_IN_EXHIBITKEY.sub('_', newprop_label)
            logger.debug("Mapping: %s -> %s" % (prop, newprop))
            for item in items:
                if prop in item:
                    item[newprop] = item[prop]
                mixed.append(item)
    else:
        mixed = []
        for dataset in datasets:
            #Replace the data set URL with the content
            logger.debug("Processing dataset: %s" % (datasets[dataset]))
            resp, content = H.request(datasets[dataset])
            items = json.loads(content)[u'items']
            mixed += items

    for (counter, item) in enumerate(mixed):
        item[u'id'] = u'_%i'%counter

    result = json.dumps({'items': mixed}, indent=4)
    return result

