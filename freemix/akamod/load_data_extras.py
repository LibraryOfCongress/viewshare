#!/usr/bin/env python
# encoding: utf-8
"""
Copyright 2008-2013 Zepheira LLC
"""

import urllib

from amara.tools.atomtools import ejsonize as atomparse
from akara.services import simple_service
from akara import logger

#
SERVICE_ID = 'http://purl.org/akara/services/builtin/atom.augmented.json'
@simple_service('GET', SERVICE_ID, 'akara.augmented.json', 'application/json')
def atom_augmented_json(url=None):
    '''
    Convert Atom syntax to Exhibit JSON, with some augmentation requested by James Leigh

    Sample request:
    * curl "http://localhost:8880/akara.augmented.json?url=http://picasaweb.google.com/data/feed/base/user/dysryi/albumid/5342439351589940049"
    '''
    url = url[0]
    feed, entries = atomparse(url)
    for e in entries:
        e[u'feed_title'] = feed[u'title']
        e[u'label'] = e[u'title']
        if u'content_src' in e:
            e[u'depiction'] = e[u'content_src']
        if u'link' in e:
            e[u'url'] = e[u'link']
    return json.dumps({'items': entries}, indent=4)


#
SERVICE_ID = 'http://purl.org/akara/services/builtin/picasa.proxy.atom'
@simple_service('GET', SERVICE_ID, 'picasa.proxy.atom', 'application/atom+xml')
def picasa_proxy_atom(path=None):
    '''
    Proxy for PicasaWeb requests, requested by James Leigh

    "picasaweb doesn't like it if your request contains a Referer header"
    "This means we can't use picasaweb images as img/@src"

    Sample request:
    * curl "http://localhost:8880/picasa.proxy.atom?path=data/feed/base/user/dysryi/albumid/5342439351589940049"
    '''
    path = path[0]
    PICASABASE = 'http://picasaweb.google.com/'
    return urllib.urlopen(PICASABASE + path).read()


SCRAPER_SERVICES = module_config().get('scraper_services', '').split()
#
#javascript:location.href = 'http://192.168.1.69:8880/z.scraper.json?url=' + encodeURIComponent(location.href)
SERVICE_ID = 'http://purl.org/akara/services/builtin/z.scraper.json'
@simple_service('GET', SERVICE_ID, 'z.scraper.json', 'application/json')
def scraper_json(url=None):
    '''
    End-point for bookmarklet that scrapes a site for RDFa then using Calais

    Sample request:
    * curl "http://localhost:8880/z.scraper.json?url=http://zepheira.com"
    '''
    for s in SCRAPER_SERVICES:
        logger.debug("Not found: " + place)
        #print >> sys.stderr, 'Trying:', s%{'url': url[0]}
        #result = urllib.urlopen(s%{'url': url[0]}).read()
        result = urllib.urlopen(s + url[0]).read()
        if result:
            return result
    return '{}'

