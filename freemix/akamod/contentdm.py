# -*- encoding: utf-8 -*-
'''
@ 2008-2013 by Uche ogbuji <uche@ogbuji.net>

This file is part of the open source Freemix project,
provided under the Apache 2.0 license.
See the files LICENSE and NOTICE for details.
Project home, documentation, distributions: http://wiki.xml3k.org/Akara

 Module name:: freemix.akaramod.contentdm

Scrapes collections from a CDM site into JSON form for Freemix

= Defined REST entry points =

http://purl.org/com/zepheira/freemix/services/contentdm.json (freemix_akara.contentdm) Handles GET

= Configuration =

None

= Notes on security =

This makes heavy access to remote CDM sites

= Notes =

( http://www.contentdm.com/ )

python contentdm_adapter.py http://digital.library.louisville.edu/cdm4/ "crutches"

 * http://digital.library.louisville.edu/collections/jthom/
 * http://digital.library.louisville.edu/cdm4/search.php

'''

import sys, time

import amara
from amara import bindery
from amara import tree
from amara.thirdparty import json
from amara.bindery.util import dispatcher, node_handler
from amara.lib.iri import absolutize
from amara.lib.util import first_item

from akara.services import simple_service
from akara import logger
from akara import module_config
from akara.util import find_peer_service

#from freemix.akara.akamod import geolookup_service
from freemix.akara.contentdm import read_contentdm
from freemix.akara.exhibit import profile_properties

try:
    import objgraph #http://mg.pov.lt/objgraph/
    def checkmem(): objgraph.show_most_common_types(limit=5)
except ImportError:
    def checkmem(): pass

DEFAULT_SITE = 'http://digital.library.louisville.edu/cdm4/'
SERVICE_ID = 'http://purl.org/com/zepheira/freemix/services/contentdm.json'

CACHE_PROXY_SERVICE_ID = 'http://purl.org/xml3k/akara/services/demo/cache-proxy'

#CDM sites don't provide HTTP cache headers, so if there is a local proxy service to add those, use it
CACHE_PROXY_SERVICE = find_peer_service(CACHE_PROXY_SERVICE_ID)

@simple_service('GET', SERVICE_ID, 'contentdm.json', 'application/json')
def contentdm(collection='all', query=None, site=DEFAULT_SITE, limit=None):
    '''
    Search all collections in Louisville:

    curl "http://localhost:8880/contentdm.json?query=crutches&site=http://digital.library.louisville.edu/cdm4/&limit=100"

    Search just /jthom collection in Louisville:

    curl "http://localhost:8880/contentdm.json?collection=/jthom&query=crutches&site=http://digital.library.louisville.edu/cdm4/&limit=100"

    Search all collections in U Miami:

    curl "http://localhost:8880/contentdm.json?query=crutches&site=http://doyle.lib.muohio.edu/cdm4/&limit=100"
    '''
    limit = int(limit) if limit else None
    results = read_contentdm(site, collection=collection, query=query, limit=limit, logger=logger, proxy=CACHE_PROXY_SERVICE)
    header = results.next()
    url = header['basequeryurl']
    count = 0
    logger.debug("Start URL: {0}, Limit: {1}".format(repr(url), limit))
    entries = list(results)
    logger.debug("Result count: {0}".format(len(entries)))
    properties = profile_properties(entries)
    #logger.debug("DEFAULT_PROPERTIES: {0}".format(DEFAULT_PROPERTIES))
    for prop in properties:
        if prop[u"property"] in DEFAULT_PROPERTIES:
            prop[u"tags"] = DEFAULT_PROPERTIES[prop[u"property"]][u"tags"]
    #checkmem()
    return json.dumps({'items': entries, 'data_profile': {"properties": properties}}, indent=4)


DEFAULT_PROFILE = {
    #"original_MIME_type": "application/vnd.ms-excel", 
    #"Akara_MIME_type_magic_guess": "application/vnd.ms-excel", 
    #"url": "/data/uche/amculturetest/data.json", 
    #"label": "amculturetest", 
    "properties": [
        {
            "property": "Object_Type", 
            "enabled": True, 
            "label": "Object type", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Source", 
            "enabled": True, 
            "label": "Source", 
            "types": [
                "text"
            ], 
            "tags": [
            ]
        }, 
        {
            "property": "id", 
            "enabled": False, 
            "label": "id", 
            "types": [
                "text"
            ], 
            "tags": [
                "property:type=url"
            ]
        }, 
        {
            "property": "link", 
            "enabled": True, 
            "label": "link", 
            "types": [
                "text"
            ], 
            "tags": [
                "property:type=url"
            ]
        }, 
        {
            "property": "Collection", 
            "enabled": True, 
            "label": "Collection", 
            "types": [
                "text"
            ], 
            "tags": [
            ]
        }, 
        {
            "property": "Digital_Publisher", 
            "enabled": True, 
            "label": "Digital publisher", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Description", 
            "enabled": True, 
            "label": "Description", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "label", 
            "enabled": False, 
            "label": "label", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Format", 
            "enabled": True, 
            "label": "Format", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Estimated_Original_Date", 
            "enabled": True, 
            "label": "Estimated original date", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Date_Original", 
            "enabled": True, 
            "label": "Original date", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "thumbnail", 
            "enabled": True, 
            "label": "thumbnail", 
            "types": [
                "text"
            ], 
            "tags": [
                "property:type=image"
            ]
        }, 
        {
            "property": "imageuri", 
            "enabled": True, 
            "label": "imageuri", 
            "types": [
                "text"
            ], 
            "tags": [
                "property:type=image"
            ]
        }, 
        {
            "property": "tags", 
            "enabled": True, 
            "label": "tags",
            "tags": [
                "property:type=text", "property:type=shredded_list"
            ]
        },
        {
            "property": "Locations_Depicted", 
            "enabled": True, 
            "label": "Depicted locations", 
            "tags": [
                "property:type=text", "property:type=shredded_list"
            ]
        }, 
        {
            "property": "Creator", 
            "enabled": True, 
            "label": "Creator", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Image_Number", 
            "enabled": True, 
            "label": "Image number", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
        {
            "property": "Collection_Website", 
            "enabled": True, 
            "label": "Collection website", 
            "types": [
                "text"
            ], 
            "tags": [
                "property:type=url"
            ]
        }, 
        {
            "property": "Citation_Information", 
            "enabled": True, 
            "label": "Citation information", 
            "types": [
                "text"
            ], 
            "tags": []
        }, 
    ], 
    #"Akara_MIME_type_guess": "application/vnd.ms-excel"
}

DEFAULT_PROPERTIES = dict([ (prop[u"property"], prop) for prop in DEFAULT_PROFILE["properties"]])
