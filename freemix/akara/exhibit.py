#freemix.akara.exhibit
"""
For more on Exhibit JSON conventions see:

* http://simile.mit.edu/wiki/Exhibit/Understanding_Exhibit_Database
* http://simile.mit.edu/wiki/Exhibit/Creating,_Importing,_and_Managing_Data

Uche's quick guidelines:

* Make sure you always have an ID (note: whether the ID should be a simple string or a URI depends on whether you need to use a focused view; if so, it should be a simple string; yes Exhibit is pretty broken in this respect)
* It's a good idea to include a type, even though it will be the same for all. I think a URI is safe here.
* It's a good idea to include a human-readable label for each.

"""

import re

import amara
from amara.lib.util import pipeline_stage
from amara.lib.util import mcompose, first_item

UNSUPPORTED_IN_EXHIBITKEY = re.compile('\W')

def fixup(ejson):
    fixup_keys(ejson)
    for k, val in ejson.items():
        if not val: del ejson[k]
    return


def fixup_keys(ejson):
    #Cannot use for k in ejson because we're mutating as we go
    for k in ejson.keys():
        new_k = UNSUPPORTED_IN_EXHIBITKEY.sub('_', k)
        if k != new_k:
            ejson[new_k] = ejson[k]
            del ejson[k]
    return


REQUIRE = lambda x: x

def prep(items, schema=None, strict=False):
    '''
    Prep a raw JSON set of items so it's more useful for simile
    
    schema is a description in code of the expectations for items, including
    descriptions to be applied to keys or values

    import string
    from amara.lib.util import mcompose, first_item
    from freemix.akara import exhibit

    PIPELINES = { u'atom:entry': {
        u"type": None,
        u"author": None,
        u"updated": None,
        #u"title": mcompose(first_item, string.strip),
        u"title": None,
        u"alternate_link": first_item,
        u"summary": (first_item, exhibit.REQUIRE),
        u"content": None,
        u"published": None,
        u"id": None, #Note: ID is always automatically required
        u"label": None,
    }, u'atom:feed': None }
    prepped = exhibit.prep(obj, schema=PIPELINES)
    '''
    remove_list = []
    for item in items:
        #print item
        if not u'id' in item:
            raise ValueError('Missing ID')
        if schema:
            match = schema.get(first_item(item.get(u'type')))
            if strict and match is None:
                remove_list.append(item)
                continue
            schema_for_item = match or {}
            #print schema_for_item
            for key in schema_for_item.keys():
                #Extract the unit transforms for the entry key and entry value
                if isinstance(schema_for_item[key], tuple):
                    value_unit, key_unit = schema_for_item[key]
                else:
                    value_unit, key_unit = schema_for_item[key], None
                #import sys; print >> sys.stderr, (key, value_unit, key_unit)
                if key_unit and key_unit is REQUIRE:
                    if key not in item:
                        raise ValueError('Missing required field: %s'%key)
                if key in item:
                    #result = pipeline_stage(schema_for_item[key], item[key]).next()
                    value = pipeline_stage(value_unit, item[key])
                    #FIXME: Now supports either REQUIRE *or* transformation, and not both. Maybe make a 3-tuple
                    if key_unit and key_unit is not REQUIRE:
                        new_key = pipeline_stage(key_unit, key)
                        del item[key]
                        key = new_key
                    item[key] = value
    for item in remove_list:
        items.remove(item)
    return items

LATLONG_PAT = re.compile(ur'[-+]?[0-9]+,[-+]?[0-9]+')

def profile_properties(items):
    '''
    Create a profile of properties from a collection of Exhibit items
    
    >>> from freemix.akara.exhibit import profile_properties
    >>> items = [{
            "Title": "Introduction for citation,  Marjory Stoneman Douglas,  Fairchild Tropical Botanic Garden,  March 19,  1978  ", 
            "Digital_ID": "asm04710000020001001  ", 
            "Date_created": "2008-06-08", 
            "Coverage_Spatial": "Coral Gables,  Florida  ", 
            "Estimated_Original_Date": "1978503519", 
            "id": "2", 
            "local_link": "#2", 
            "label": "Introduction for citation,  Marjory Stoneman Douglas,  Fairchild Tropical Botanic Garden,  March 19,  1978  ", 
            "thumbnail": "http://merrick.library.miami.edu/cgi-bin/thumbnail.exe?CISOROOT=/asm0471&CISOPTR=2", 
            "Date_Original": "1978-03-19  ", 
            "imageuri": "http://merrick.library.miami.edu/cdm4/images/spacer.gif", 
            "link": "http://merrick.library.miami.edu/cdm4/item_viewer.php?CISOROOT=/asm0471&CISOPTR=2&CISOBOX=1&REC=5", 
            "Summary": "Script of a speech given on the occasion of the planting of a tree at Fairchild Tropical Botanic Garden in commemoration of Marjory Stoneman Douglas.  ", 
            "Subject": [
                "Douglas", 
                "Marjory Stoneman", 
                "Fairchild Tropical Botanic Garden"
            ]
        }, 
        {
            "domain": "merrick.library.miami.edu", 
            "Container": "Box No. 6, Folder Title: Fisher, Jane., ", 
            "Copyright": "http://merrick.library.miami.edu/digitalprojects/copyright.html ", 
            "Digital_ID": "asm04710000060001001  ", 
            "id": "5", 
            "Repository": "University of Miami Libraries. Special Collections ", 
            "label": "Jane Fisher letter to Helen Muir,  May 14,  1953  ", 
            "thumbnail": "http://merrick.library.miami.edu/cgi-bin/thumbnail.exe?CISOROOT=/asm0471&CISOPTR=5", 
            "Language": "eng ", 
            "Date_Original": "1953-03-14  ", 
            "imageuri": "http://merrick.library.miami.edu/cdm4/images/spacer.gif", 
            "link": "http://merrick.library.miami.edu/cdm4/item_viewer.php?CISOROOT=/asm0471&CISOPTR=5&CISOBOX=1&REC=6", 
            "Physical_Description": "1 typewritten leaf ", 
            "Height": "6763 ", 
            "Subject": [
                "Fisher", 
                "Carl G. (Carl Graham)", 
                "1874-1939", 
                "Muir", 
                "Helen", 
                "1911-", 
                "letters"
            ]
        }]
    >>> profile_properties(items)
    [{'property': 'Digital_ID', 'enabled': True, 'types': ['text'], 'label': 'Digital_ID'}, {'property': 'Container', 'enabled': True, 'types': ['text'], 'label': 'Container'}, {'property': 'Language', 'enabled': True, 'types': ['text'], 'label': 'Language'}, {'property': 'Copyright', 'enabled': True, 'types': ['text'], 'label': 'Copyright'}, {'property': 'Date_Original', 'enabled': True, 'types': ['text'], 'label': 'Date_Original'}, {'property': 'Repository', 'enabled': True, 'types': ['text'], 'label': 'Repository'}, {'property': 'Physical_Description', 'enabled': True, 'types': ['text'], 'label': 'Physical_Description'}, {'property': 'Title', 'enabled': True, 'types': ['text'], 'label': 'Title'}, {'property': 'label', 'enabled': False, 'types': ['text'], 'label': 'label'}, {'property': 'local_link', 'enabled': True, 'types': ['text'], 'label': 'local_link'}, {'property': 'imageuri', 'enabled': True, 'types': ['text'], 'label': 'imageuri'}, {'property': 'thumbnail', 'enabled': True, 'types': ['text'], 'label': 'thumbnail'}, {'property': 'Height', 'enabled': True, 'types': ['text'], 'label': 'Height'}, {'property': 'link', 'enabled': True, 'types': ['text'], 'label': 'link'}, {'property': 'domain', 'enabled': True, 'types': ['text'], 'label': 'domain'}, {'property': 'Coverage_Spatial', 'enabled': True, 'types': ['text'], 'label': 'Coverage_Spatial'}, {'property': 'Date_created', 'enabled': True, 'types': ['text'], 'label': 'Date_created'}, {'property': 'Summary', 'enabled': True, 'types': ['text'], 'label': 'Summary'}, {'property': 'Estimated_Original_Date', 'enabled': True, 'types': ['text'], 'label': 'Estimated_Original_Date'}, {'property': 'id', 'enabled': False, 'types': ['text'], 'label': 'id'}, {'property': 'Subject', 'enabled': True, 'types': ['text'], 'label': 'Subject'}]
    '''
    def guess_type(k):
        t = "text"
        values = [ item[k] for item in items if item.get(k) is not None ]
        #If the first value looks like a latlong, check whether they all do; if so, guess that type
        if values and LATLONG_PAT.match(values[0]):
            for v in values:
                if not LATLONG_PAT.match(values[0]):
                    break
            else:
                t = "property:type=text", "property:type=shredded_list"
        return t

    #Does the data profile properties dict need updating?
    keys = dict([ (k, k) for obj in items for k in obj ])
    #FIXME: reduce from 3 full passes through obj to 2 (don't think we can go lower than 2)
    for k in keys:
        kcount = reduce(lambda count, obj, k=k: count + int(k in obj), items, 0)
        #logger.debug("Key usage count %s: %i" % (k, kcount))
        if not kcount:
            del keys[k]

    properties = [
        {
            "property": k,
            "enabled": (k not in ("id", "label")),
            "label": v,
            #"types": [guess_type(k)]
            "types": ["text"]
        } for k, v in keys.iteritems()
    ]
    return properties


