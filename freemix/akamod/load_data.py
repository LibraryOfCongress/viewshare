#!/usr/bin/env python
# encoding: utf-8
"""
Copyright 2008-2013 Zepheira LLC

Requires httplib2 Python module and bibutils

http://sourceforge.net/p/bibutils/home/Bibutils/

Note: macports includes bibutils, but not yet 4.0 (sudo port install bibutils)
"""

import sys, re, os, time
import urlparse
import urllib
import httplib
import hashlib
import cStringIO
from functools import *
from itertools import *
from operator import *
from contextlib import closing

import amara
from amara import bindery
from amara.lib import U
from amara.lib.xmlstring import isxml
from amara.tools.atomtools import ejsonize as atomparse
from amara.tools.atomtools import ATOM_IMT
from amara.thirdparty import json, httplib2

from akara.services import simple_service
from akara import logger
from akara import module_config
from akara import response
from akara.caching import cache, make_named_cache

from zen import spreadsheet as spreadsheetlib
from zen.temporal import smart_parse_date
from zen.csvhelper import readcsv
from zen.mods import mods2json#, MODS_NAMESPACE
#from zen.akamod import geolookup_service
from zen.whatfile import guess_imt
from zen.feeds import webfeed
from zen.exhibit import UNSUPPORTED_IN_EXHIBITKEY
from zen import ejsonify

from . import __version__ as VERSION

CHUNKCOUNT = 10

BIBTEX2MODS = module_config().get('bib2xml_command', 'bib2xml')
DIAGNOSTICS = module_config().get('dataload_diagnostics', False)

BIBTEX_IMT = ["application/x-bibtex", "text/x-bibtex"]

GENERIC_BINARY_IMT = 'application/octet-stream'
UNKNOWN_IMT = 'application/unknown'
UNKNOWN_TEXT_IMT = 'text/unknown'
EXCEL_IMTS = ['application/vnd.ms-excel', 'application/vnd.ms-office', 'application/msword', GENERIC_BINARY_IMT]

#FIXME: Will grow monotonically.  Switch to LRU algo
#CACHE = {}
EXHIBIT_RESERVED = ['label', 'id', 'type']

MODS_NAMESPACE = 'http://www.loc.gov/mods/v3'

#GEOLOOKUP_CACHE = cache('http://purl.org/com/zepheira/services/geolookup.json', expires=24*60*60)

def guess_imt_(body, ctype):
    '''
    Support function for freemix services.  Inital processing to guess media type of post body.
    '''
    #fileguesser = Magic(mime=True)
    #orig_imt = WSGI_ENVIRON['Content-Type'].partition(';')[0]
    m = hashlib.md5(body)
    #print >> sys.stderr, "Body: ", body[:100]
    bodyhash = m.hexdigest()
    logger.debug('MD5 Hash of HTTP body: ' + str(bodyhash))
    logger.debug('Size of HTTP body: ' + str(len(body)))
    #if bodyhash in CACHE:
    #    print >> sys.stderr, "Cache hit"
    #    return CACHE[bodyhash]
    try:
        imt = guess_imt(body)
    except RuntimeError, e:
        logger.debug(str(e))
        imt = UNKNOWN_IMT
    #imt = fileguesser.from_buffer(body)
    logger.debug('Sniffed IMT: ' + imt)
    return imt


def post(body, sink):
    '''
    Helper function to post a chunk of JSON to a given endpoint (the sink)
    '''
    headers = {'Content-type' : 'application/json'}
    h = httplib2.Http()
    resp, content = h.request(sink, "POST", body=body, headers=headers)
    return resp, content


#dataprofile & objkeys mutated in place
def prepare_chunk(chunk, dataprofile, objkeys, augmented_properties):
    '''
    Take a very simple Exhibit JSON-like array such as we get from most of the data modules and fix it up to be fully eJSON compliant
    '''
    #logger.debug('CHUNK: ' + repr(chunk))
    newkeys = dict([ (k, k) for obj in chunk for k in obj if k not in objkeys ])
    if not objkeys:
        objkeys, newkeys = newkeys, {}
    #
    #for k in newkeys:
    #    kcount = reduce(lambda count, obj, k=k: a + int(k in obj), chunk)
    #    logger.debug("KCOUNT " + kcount)
    #    if not kcount:
    #        del objkeys[k]

    #logger.debug("objkeys: " + repr(objkeys))
    #logger.debug("dataprofile: " + repr(dataprofile))
    def fixup_newkeys():
        for k in newkeys:
            if not isinstance(k, basestring):
                #Yes we could receive non-string "labels"
                k = unicode(k)
            new_k = UNSUPPORTED_IN_EXHIBITKEY.sub(u'_', k)
            if not new_k or new_k[0].isdigit():
                new_k = u'_' + new_k
            if k != new_k:
                newkeys[new_k] = k
            if k in newkeys: del newkeys[k]

    #
    def fixup_obj_keys():
        keymap = dict([ (old_k, new_k) for (new_k, old_k) in objkeys.items() ])
        for obj in chunk:
            for k, v in obj.iteritems():
                if k != keymap[k]:
                    obj[keymap[k]] = v
                    del obj[k]

    fixup_newkeys()
    objkeys.update(newkeys)
    fixup_obj_keys()

    augmentations = {}
    def handle_augmentations():
        #chunk, propertyinfo, augmentations = {}
        for prop in dataprofile["properties"]:
            for aug, handler in AUGMENTATIONS.items():
                if aug in prop["types"]:
                    items_list = []
                    property_marker = u'property:' + prop[u'property']
                    augmentations[property_marker] = {'items': items_list}
                    handler(chunk, prop, items_list)
                    #Communicate back the updated properties
                    augmented_properties.append(property_marker)

    handle_augmentations()

    #Does the data profile properties dict need updating?
    if not dataprofile["properties"] or newkeys:
        dataprofile["properties"] = [{"property": k, "enabled": True, "label": v, "types": []} for k, v in objkeys.iteritems()]

    #print >> sys.stderr, objkeys
    #            {"property": "Speakers", "enabled": true, "tags": ["property:type=text"]},
    #            {"property": "Title", "enabled": true, "label": "Title", "tags": ["property:type=text"]},

    response = {'transformed_items': chunk, 'data_profile': dataprofile}
    response.update(augmentations)
    return json.dumps(response, indent=4)


SERVICE_ID = 'http://purl.org/com/zepheira/services/async.freemix.json'
@simple_service('GET', SERVICE_ID, 'async.freemix.json', 'text/plain')
def async_freemix(source, sink):
    #See: http://foundry.zepheira.com/issues/133#note-4
    '''
    Render the contents of a file as best as possible in Exhibit JSON
    * Supports Excel, BibTex and JSON for now

    Sample queries:
    * curl "http://localhost:8880/async.freemix.json?source=file:///tmp/foo.js&sink=http://localhost:8880/testsink.json"
    * curl --request POST --data-binary "@foo.xls" --header "Content-Type: application/vnd.ms-excel" "http://localhost:8880/freemix.json"
    '''
    fixup_obj_labels = True
    body = urllib.urlopen(source).read()
    obj = json.loads(body)
    dataprofile = obj['data_profile']
    objkeys = {}
    #if imt in EXCEL_IMTS:
    #    source = speadsheet.read(body)
    #    try:
    #        for chunk in source.chunks():
    #            body = prepare_chunk(chunk, dataprofile, objkeys)
    #            post(body, sink)
    #    except (KeyboardInterrupt, SystemExit):
    #        raise
    #    except Exception, e:
    #        raise
    #        logger.debug("Exception processing spreadsheet: " + e)
    #    imt = EXCEL_IMTS[0]
    #    post(json.dumps({'completed': True}), sink)
    #
    #obj = json.loads(body.decode('iso-8859-1').encode('utf-8'))
    data = obj[u'items']
    augmented_properties = []
    #fixup_obj_labels = False
    #imt = BIBTEX_IMT[0]
    def chunks():
        for ordinal, chunkinfo in groupby(enumerate(data), lambda t: t[0] / CHUNKCOUNT):
            yield [ obj for (ix, obj) in chunkinfo ]
            #yield [ row for (ix, row) in rowinfo ]
            #for (ix, obj) in chunkinfo:
            #    yield obj
    response_chunks = []
    for chunk in chunks():
        body = prepare_chunk(chunk, dataprofile, objkeys, augmented_properties)
        resp, content = post(body, sink)
        response_chunks.append(content)
        response_chunks.append('-'*72)
    completion_flags = dict([(property_marker, {'completed': True}) for property_marker in augmented_properties])
    resp, content = post(json.dumps(completion_flags), sink)
    response_chunks.append(content)
    return 'Output has gone to sink (%s), whose aggregated responses are: %s'%(sink, '\n'.join(response_chunks))


SERVICE_ID = 'http://purl.org/com/zepheira/services/freemix.json'
@simple_service('POST', SERVICE_ID, 'freemix.json', 'application/json')
def freemix(body, ctype, maxcount=None, diagnostics=None):
    '''
    Render the contents of a file as best as possible in Exhibit JSON
    * Supports Excel, BibTex and JSON for now

    Sample queries:
    * curl --request POST --data-binary @- http://localhost:8880/freemix.json?diagnostics=yes < test/data/load/iraq.xml
    * curl --request POST --data-binary @- http://localhost:8880/freemix.json < test/data/load/iraq.xml
    * curl --request POST --data-binary "@foo.xls" --header "Content-Type: application/vnd.ms-excel" "http://localhost:8880/freemix.json"
    '''
    #curl --request POST --data-binary "@foo.xls" --header "Content-Type: application/msword" "http://localhost:8880/freemix.json"

    #FIXME: OK enough tower-of-pisa code.  Use more functions

    #DIAGNOSTICS config no longer used at all
    #if diagnostics is None:
    #    diagnostics = DIAGNOSTICS
    #else:
    diagnostics = diagnostics == u'yes'
    logger.debug('diagnostics: ' + repr(diagnostics))
    fixup_obj_labels = True
    imt_saved = imt = guess_imt_(body, ctype)
    #logger.debug("IMT: " + imt)
    ss_data = None
    diag_info = []
    if imt == UNKNOWN_IMT:
        try:
            source = speadsheet.read(body)
            ss_data = [ row for row in source.rows() ]
            imt = EXCEL_IMTS[0]
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception, e:
            pass
    if imt in EXCEL_IMTS:
        source = speadsheet.read(body)
        dataprofile = {}
        try:
            data = ss_data or [ row for row in source.rows() ]
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception, e:
            raise
            #print >> sys.stderr, e
            #print >> sys.stderr, 'Spreadsheet processing failure.  No data to return.'
        imt = EXCEL_IMTS[0]
    elif isxml(body):
        if MODS_NAMESPACE in body:
            try:
                data, diag_info = mods2json(body, diagnostics)
                imt = 'application/x-mods+xml'
            except amara.ReaderError:
                raise ValueError('Unable to process content')
        else:
            try:
                data = atomparse(body)
                logger.debug("ATOM: " + repr(data))
            except ValueError:
                data = webfeed(body)
                imt = 'application/rss+xml'
                if data is None:
                    raise ValueError('Unable to process content')
            else:
                imt = ATOM_IMT
    else:
        lead = body.strip()
        if lead.startswith('%%') or lead.startswith('@'):
            #BibTex
            cmdline = 'bib2xml'
            process = Popen(cmdline, stdin=PIPE, stdout=PIPE, universal_newlines=True, shell=True)
            mods, perr = process.communicate(input=body)
            if not mods:
                #FIXME: L10N
                raise ValueError('Empty output from the command line.  Probably a failure.  Command line: "%s"'%cmdline)
            #print >> sys.stderr, mods[:100]
            data, diag_info = mods2json(body, diagnostics)
            imt = 'application/x-bibtex'
        else:
            ejsonify_output = []
            if ejsonify.is_json(body):
                obj = ejsonify_output[0]
                data = obj[u'items']
                fixup_obj_labels = False
                imt = BIBTEX_IMT[0]
            else:
                #FIXME: how to deal with CSV character sets?
                data = readcsv(body)

    if maxcount:
        data = data[:int(maxcount)]

    #FIXME: Following redundant now that we have add_ejson_profile
    #Keeping it to avoid breaking what's working for now
    objkeys = dict([ (k, k) for obj in data for k in obj ])
    #FIXME: reduce from 3 full passes through obj to 2 (don't think we can go lower than 2)
    for k in objkeys:
        kcount = reduce(lambda count, obj, k=k: count + int(k in obj), data, 0)
        logger.debug("Key usage count %s: %i" % (k, kcount))
        if not kcount:
            del objkeys[k]
    logger.debug("Modified data profile keys: " + repr(objkeys))
    if fixup_obj_labels:
        for obj in data:
            for k in obj:
                #Yes we could receive non-string "labels"
                if not isinstance(k, basestring):
                    k = str(k)
                new_k = UNSUPPORTED_IN_EXHIBITKEY.sub('_', k)
                if not new_k or new_k[0].isdigit():
                    new_k = '_' + new_k
                if k != new_k:
                    objkeys[new_k] = k
                    try:
                        del objkeys[k]
                    except KeyError:
                        pass
                    obj[new_k] = obj[k]
                    del obj[k]
    #print >> sys.stderr, objkeys

    profile = {
        "original_MIME_type": ctype,
        "Akara_MIME_type_magic_guess": imt_saved,
        "Akara_MIME_type_guess": imt,
        "properties": [
            {"property": k, "enabled": (k not in ("id", "label")), "label": v, "types": ["text"]} for k, v in objkeys.iteritems()
#            {"property": "Speakers", "enabled": true, "tags": ["property:type=text"]},
#            {"property": "Title", "enabled": true, "label": "Title", "tags": ["property:type=text"]},
        ]
    }
#    profile["properties"]["property"]
    info = {'items': data, 'data_profile': profile}
    if diag_info:
        info['diagnostics'] = diag_info
    result = json.dumps(info, indent=4)
    #CACHE[bodyhash] = result
    return result


def add_ejson_profile(data, fixup_obj_labels=True):
    objkeys = dict([ (k, k) for obj in data for k in obj ])
    #FIXME: reduce from 3 full passes through obj to 2 (don't think we can go lower than 2)
    for k in objkeys:
        kcount = reduce(lambda count, obj, k=k: count + int(k in obj), data, 0)
        logger.debug("Key usage count %s: %i" % (k, kcount))
        if not kcount:
            del objkeys[k]
    logger.debug("Modified data profile keys: " + repr(objkeys))
    if fixup_obj_labels:
        for obj in data:
            for k in obj:
                #Yes we could receive non-string "labels"
                if not isinstance(k, basestring):
                    k = str(k)
                new_k = UNSUPPORTED_IN_EXHIBITKEY.sub('_', k)
                if not new_k or new_k[0].isdigit():
                    new_k = '_' + new_k
                if k != new_k:
                    objkeys[new_k] = k
                    try:
                        del objkeys[k]
                    except KeyError:
                        pass
                    obj[new_k] = obj[k]
                    del obj[k]
    #print >> sys.stderr, objkeys

    return {"properties": [
                {"property": k, "enabled": (k not in ("id", "label")), "label": v, "types": ["text"]} for k, v in objkeys.iteritems()
            ]}


SERVICE_ID = 'http://purl.org/com/zepheira/services/json.nav.prep.json'
@simple_service('POST', SERVICE_ID, 'json.nav.prep', 'application/json')
def json_nav_prep(body, ctype):
    '''
    Read and analyze a JSON file to support the UI for having the user
    navigate and select an array for extract (see load_extract)

    Sample queries:
    * curl --request POST --data-binary @- http://localhost:8880/json.nav.prep.json < test/data/load/somefeed.json
    '''
    ejsonify_output = []
    if ejsonify.is_json(body, ejsonify_output):
        obj = ejsonify_output[0]
        result = ejsonify.analyze_for_nav(obj)
        result = json.dumps(result, indent=4)
        return result
    else:
        raise ValueError('Unable to process content')


SERVICE_ID = 'http://purl.org/com/zepheira/services/load.extract.json'
@simple_service('POST', SERVICE_ID, 'load.extract.json', 'application/json')
def load_extract(body, ctype):
    '''
    Read two JSON files merged with a LINEFEED, and use the specification
    to extract an array from the JSON source

    Sample queries:
    * curl --request POST --data-binary @- http://localhost:8880/load.extract.json < test/data/load/json_plus_spec.dat
    '''
    file1, file2 = body.split('\f')
    file1_parsed = []
    if ejsonify.is_json(file1, file1_parsed):
        file1_parsed = file1_parsed[0]
        file2_parsed = []
        if not file2 or ejsonify.is_json(file2, file2_parsed):
            if file2:
                file2_parsed = file2_parsed[0]
            else:
                file2_parsed = None
            result = ejsonify.pull_ejson_by_patterns(file1_parsed, file2_parsed)
            items = result[u'items']
            profile = add_ejson_profile(items)
            result = json.dumps({'items': items, 'data_profile': profile}, indent=4)
            return result
    raise ValueError('Unable to process content')


SEARCH_AREA_SIZE = 10

class speadsheet(object):
    @staticmethod
    #read is a factory method that returns an ss instance or None
    def read(body):
        source = speadsheet()
        source.body = body
        return source

    def chunks(self):
        for ordinal, rowinfo in groupby(enumerate(self.rows()), lambda t: t[0] / CHUNKCOUNT):
            #yield [ row for (ix, row) in rowinfo ]
            for (ix, row) in rowinfo:
                yield row

    def rows(self):
        #entries = []
        unique_cols = {}
        #if url:
        #    content = urllib2.urlopen(url).read()
        #    source = url
        #else:
        #    content = req.body
        #    source = "POST BODY"

        xls = spreadsheetlib.readexcel(file_contents=self.body)
        #xls = readexcel(file_contents=req.body)
        sheet_name = xls.book.sheet_names()[0]
        for count, row in enumerate(xls.iter_dict(sheet_name)):
            entry = row.copy()
            for k in EXHIBIT_RESERVED:
                if k in entry:
                    entry[k + '_'] = entry[k]
                    del entry[k]

            entry['label'] = '_' + str(count)
            entry['id'] = '_' + str(count)
            for key in entry.keys():
                if entry[key] == u"": del entry[key]
            remove = set(entry.keys()).difference(unique_cols.keys())
            #print remove
            for key in remove:
                if key in unique_cols: del unique_cols[key]
            for key in entry:
                unique_values = unique_cols.setdefault(key, [])
                if entry[key] in unique_values:
                    del unique_cols[key]
                else:
                    unique_values.append(key)
            yield entry


SERVICE_ID = 'http://purl.org/com/zepheira/services/freemix.loader.revision'
@simple_service('GET', SERVICE_ID, 'freemix.loader.revision', 'text/plain')
def revision():
    '''
    Sample queries:
    * curl http://localhost:8880/freemix.loader.revision
    '''
    from zen import __version__
    return 'Freemix data loader ' + VERSION + ' | Zen version: ' + __version__

